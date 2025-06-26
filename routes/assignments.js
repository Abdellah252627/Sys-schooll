const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadAssignment } = require('../middleware/upload');

// Get all assignments (for teachers/admins)
router.get('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    let query = `
      SELECT a.*, c.name as className, c.grade 
      FROM assignments a
      JOIN classes c ON a.classId = c.id
    `;
    
    // If user is a teacher, only show their classes' assignments
    if (req.user.role === 'teacher') {
      query += ' WHERE c.teacherId = ?';
      var assignments = await req.db.all(query, [req.user.id]);
    } else {
      var assignments = await req.db.all(query);
    }
    
    res.render('assignments/index', {
      title: 'الواجبات',
      assignments
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    req.flash('error', 'حدث خطأ أثناء جلب الواجبات');
    res.redirect('/dashboard');
  }
});

// Get assignments for a specific class
router.get('/class/:classId', protect, async (req, res) => {
  try {
    const assignments = await req.db.all(
      `SELECT a.*, 
        (SELECT COUNT(*) FROM submissions WHERE assignmentId = a.id AND status = 'submitted') as submissionsCount,
        (SELECT COUNT(*) FROM submissions WHERE assignmentId = a.id AND status = 'graded') as gradedCount
       FROM assignments a 
       WHERE a.classId = ? 
       ORDER BY a.dueDate DESC`,
      [req.params.classId]
    );
    
    const classInfo = await req.db.get(
      'SELECT name, grade FROM classes WHERE id = ?',
      [req.params.classId]
    );

    res.render('assignments/class-assignments', {
      title: `واجبات ${classInfo.grade} - ${classInfo.name}`,
      assignments,
      classId: req.params.classId,
      classInfo
    });
  } catch (error) {
    console.error('Error fetching class assignments:', error);
    req.flash('error', 'حدث خطأ أثناء جلب واجبات الفصل');
    res.redirect('/classes/' + req.params.classId);
  }
});

// View assignment details
router.get('/:id', protect, async (req, res) => {
  try {
    const assignment = await req.db.get(
      `SELECT a.*, c.name as className, c.grade, 
              u.name as teacherName, u.id as teacherId
       FROM assignments a
       JOIN classes c ON a.classId = c.id
       JOIN users u ON c.teacherId = u.id
       WHERE a.id = ?`,
      [req.params.id]
    );

    if (!assignment) {
      req.flash('error', 'الواجب غير موجود');
      return res.redirect('/assignments');
    }

    // Get submissions if user is teacher/admin or the assignment creator
    let submissions = [];
    if (req.user.role === 'teacher' || req.user.role === 'admin' || req.user.id === assignment.teacherId) {
      submissions = await req.db.all(
        `SELECT s.*, u.name as studentName, u.id as studentId, u.avatar
         FROM submissions s
         JOIN users u ON s.studentId = u.id
         WHERE s.assignmentId = ?
         ORDER BY s.submittedAt DESC`,
        [req.params.id]
      );
    } else if (req.user.role === 'student') {
      // For students, only show their own submission
      submissions = await req.db.all(
        `SELECT * FROM submissions 
         WHERE assignmentId = ? AND studentId = ?
         ORDER BY submittedAt DESC`,
        [req.params.id, req.user.id]
      );
    }

    // Check if the current user has already submitted
    const hasSubmitted = submissions.some(sub => sub.studentId === req.user.id);
    const isTeacherOrAdmin = ['teacher', 'admin'].includes(req.user.role);
    const isCreator = req.user.id === assignment.teacherId;

    res.render('assignments/view', {
      title: assignment.title,
      assignment,
      submissions,
      hasSubmitted,
      isTeacherOrAdmin,
      isCreator,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    req.flash('error', 'حدث خطأ أثناء جلب بيانات الواجب');
    res.redirect('/assignments');
  }
});

// Create assignment form (teachers/admins only)
router.get('/new', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    // Get classes taught by the current teacher
    const classes = await req.db.all(
      'SELECT id, name, grade FROM classes WHERE teacherId = ?',
      [req.user.id]
    );

    if (classes.length === 0) {
      req.flash('info', 'يجب عليك إنشاء فصل دراسي أولاً قبل إضافة واجب');
      return res.redirect('/classes/new');
    }

    res.render('assignments/new', {
      title: 'إضافة واجب جديد',
      classes
    });
  } catch (error) {
    console.error('Error loading new assignment form:', error);
    req.flash('error', 'حدث خطأ أثناء تحميل نموذج إضافة واجب');
    res.redirect('/dashboard');
  }
});

// Create new assignment
router.post('/', protect, authorize('admin', 'teacher'), uploadAssignment.single('attachment'), async (req, res) => {
  try {
    const { title, description, classId, dueDate, totalMarks } = req.body;
    let attachmentPath = null;

    if (req.file) {
      attachmentPath = `/uploads/assignments/${req.file.filename}`;
    }

    // Insert the new assignment
    const result = await req.db.run(
      'INSERT INTO assignments (title, description, classId, dueDate, totalMarks, attachment, teacherId) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, classId, dueDate, totalMarks, attachmentPath, req.user.id]
    );

    req.flash('success', 'تم إضافة الواجب بنجاح');
    res.redirect(`/assignments/${result.lastID}`);
  } catch (error) {
    console.error('Error creating assignment:', error);
    req.flash('error', 'حدث خطأ أثناء إضافة الواجب');
    res.redirect('/assignments/new');
  }
});

// Submit assignment (students only)
router.post('/:id/submit', protect, authorize('student'), uploadAssignment.single('submissionFile'), async (req, res) => {
  try {
    const { notes } = req.body;
    let submissionPath = null;

    if (!req.file) {
      req.flash('error', 'يجب رفع ملف التسليم');
      return res.redirect(`/assignments/${req.params.id}`);
    }

    submissionPath = `/uploads/submissions/${req.file.filename}`;

    // Check if student has already submitted
    const existingSubmission = await req.db.get(
      'SELECT id FROM submissions WHERE assignmentId = ? AND studentId = ?',
      [req.params.id, req.user.id]
    );

    if (existingSubmission) {
      // Update existing submission
      await req.db.run(
        'UPDATE submissions SET filePath = ?, notes = ?, submittedAt = CURRENT_TIMESTAMP, status = ? WHERE id = ?',
        [submissionPath, notes, 'submitted', existingSubmission.id]
      );
      req.flash('success', 'تم تحديث تسليم الواجب بنجاح');
    } else {
      // Create new submission
      await req.db.run(
        'INSERT INTO submissions (assignmentId, studentId, filePath, notes, status) VALUES (?, ?, ?, ?, ?)',
        [req.params.id, req.user.id, submissionPath, notes, 'submitted']
      );
      req.flash('success', 'تم تسليم الواجب بنجاح');
    }

    res.redirect(`/assignments/${req.params.id}`);
  } catch (error) {
    console.error('Error submitting assignment:', error);
    req.flash('error', 'حدث خطأ أثناء تسليم الواجب');
    res.redirect(`/assignments/${req.params.id}`);
  }
});

// Grade submission (teachers/admins only)
router.post('/:id/grade/:submissionId', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    
    // Update the submission with grade and feedback
    await req.db.run(
      'UPDATE submissions SET grade = ?, feedback = ?, gradedAt = CURRENT_TIMESTAMP, status = ? WHERE id = ?',
      [grade, feedback, 'graded', req.params.submissionId]
    );

    req.flash('success', 'تم تقييم الواجب بنجاح');
    res.redirect(`/assignments/${req.params.id}`);
  } catch (error) {
    console.error('Error grading submission:', error);
    req.flash('error', 'حدث خطأ أثناء تقييم الواجب');
    res.redirect(`/assignments/${req.params.id}`);
  }
});

// Delete assignment (teachers/admins only)
router.delete('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    // Check if assignment exists and user is the creator
    const assignment = await req.db.get(
      'SELECT id, teacherId FROM assignments WHERE id = ?',
      [req.params.id]
    );

    if (!assignment) {
      req.flash('error', 'الواجب غير موجود');
      return res.redirect('/assignments');
    }

    if (req.user.role !== 'admin' && assignment.teacherId !== req.user.id) {
      req.flash('error', 'غير مصرح لك بحذف هذا الواجب');
      return res.redirect(`/assignments/${req.params.id}`);
    }

    // Delete associated submissions first
    await req.db.run('DELETE FROM submissions WHERE assignmentId = ?', [req.params.id]);
    
    // Then delete the assignment
    await req.db.run('DELETE FROM assignments WHERE id = ?', [req.params.id]);

    req.flash('success', 'تم حذف الواجب بنجاح');
    res.redirect('/assignments');
  } catch (error) {
    console.error('Error deleting assignment:', error);
    req.flash('error', 'حدث خطأ أثناء حذف الواجب');
    res.redirect(`/assignments/${req.params.id}`);
  }
});

module.exports = router;
