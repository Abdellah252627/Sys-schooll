const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Get all grades (admin/teacher only)
router.get('/', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const grades = await req.db.all(`
      SELECT g.*, 
             s.name as studentName, 
             u.name as gradedByName,
             c.name as className,
             a.title as assignmentTitle
      FROM grades g
      JOIN users s ON g.studentId = s.id
      JOIN users u ON g.gradedBy = u.id
      JOIN classes c ON g.classId = c.id
      LEFT JOIN assignments a ON g.assignmentId = a.id
      ORDER BY g.gradedAt DESC
    `);

    res.render('grades/index', {
      title: 'الدرجات',
      grades
    });
  } catch (error) {
    console.error('Error fetching grades:', error);
    req.flash('error', 'حدث خطأ أثناء جلب الدرجات');
    res.redirect('/dashboard');
  }
});

// Get grades for a specific student
router.get('/students/:studentId', async (req, res) => {
  try {
    // Check if user is authorized (admin, teacher, or the student themselves)
    if (req.user.role === 'student' && req.user.id !== parseInt(req.params.studentId)) {
      req.flash('error', 'غير مصرح لك بمشاهدة درجات طالب آخر');
      return res.redirect('/dashboard');
    }

    const student = await req.db.get('SELECT name FROM users WHERE id = ?', [req.params.studentId]);
    if (!student) {
      req.flash('error', 'الطالب غير موجود');
      return res.redirect('/dashboard');
    }

    const grades = await req.db.all(`
      SELECT g.*, 
             c.name as className,
             a.title as assignmentTitle,
             sub.subject as subjectName
      FROM grades g
      JOIN classes c ON g.classId = c.id
      LEFT JOIN assignments a ON g.assignmentId = a.id
      LEFT JOIN subjects sub ON a.subjectId = sub.id
      WHERE g.studentId = ?
      ORDER BY g.gradedAt DESC
    `, [req.params.studentId]);

    // Calculate GPA and other statistics
    const stats = {
      total: grades.length,
      average: 0,
      highest: 0,
      lowest: 100
    };

    if (grades.length > 0) {
      const sum = grades.reduce((acc, grade) => {
        stats.highest = Math.max(stats.highest, grade.grade);
        stats.lowest = Math.min(stats.lowest, grade.grade);
        return acc + grade.grade;
      }, 0);
      
      stats.average = (sum / grades.length).toFixed(2);
    }

    res.render('grades/student', {
      title: `درجات الطالب ${student.name}`,
      grades,
      student,
      stats
    });
  } catch (error) {
    console.error('Error fetching student grades:', error);
    req.flash('error', 'حدث خطأ أثناء جلب درجات الطالب');
    res.redirect('/dashboard');
  }
});

// Add/Edit grade form (admin/teacher only)
router.get('/:classId/students/:studentId/assignments/:assignmentId', 
  authorize('admin', 'teacher'), 
  async (req, res) => {
    try {
      const { classId, studentId, assignmentId } = req.params;
      
      // Get class info
      const classInfo = await req.db.get('SELECT * FROM classes WHERE id = ?', [classId]);
      if (!classInfo) {
        req.flash('error', 'الفصل غير موجود');
        return res.redirect('/classes');
      }

      // Get student info
      const student = await req.db.get('SELECT * FROM users WHERE id = ? AND role = ?', 
        [studentId, 'student']);
      if (!student) {
        req.flash('error', 'الطالب غير موجود');
        return res.redirect(`/classes/${classId}`);
      }

      // Get assignment info
      const assignment = await req.db.get('SELECT * FROM assignments WHERE id = ?', [assignmentId]);
      if (!assignment) {
        req.flash('error', 'الواجب غير موجود');
        return res.redirect(`/classes/${classId}`);
      }

      // Check if grade already exists
      const existingGrade = await req.db.get(
        'SELECT * FROM grades WHERE studentId = ? AND assignmentId = ?',
        [studentId, assignmentId]
      );

      res.render('grades/form', {
        title: existingGrade ? 'تعديل الدرجة' : 'إضافة درجة',
        classInfo,
        student,
        assignment,
        grade: existingGrade || { grade: '', notes: '' }
      });
    } catch (error) {
      console.error('Error loading grade form:', error);
      req.flash('error', 'حدث خطأ أثناء تحميل نموذج الدرجة');
      res.redirect('/dashboard');
    }
  }
);

// Save grade (admin/teacher only)
router.post('/save', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { studentId, classId, assignmentId, grade, notes } = req.body;

    // Validate input
    if (!studentId || !classId || !assignmentId || grade === undefined) {
      req.flash('error', 'جميع الحقول مطلوبة');
      return res.redirect('back');
    }

    const numericGrade = parseFloat(grade);
    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
      req.flash('error', 'يجب أن تكون القيمة بين 0 و 100');
      return res.redirect('back');
    }

    // Check if grade already exists
    const existingGrade = await req.db.get(
      'SELECT id FROM grades WHERE studentId = ? AND assignmentId = ?',
      [studentId, assignmentId]
    );

    if (existingGrade) {
      // Update existing grade
      await req.db.run(
        'UPDATE grades SET grade = ?, notes = ?, gradedBy = ?, gradedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [numericGrade, notes, req.user.id, existingGrade.id]
      );
      req.flash('success', 'تم تحديث الدرجة بنجاح');
    } else {
      // Insert new grade
      await req.db.run(
        'INSERT INTO grades (studentId, classId, assignmentId, grade, notes, gradedBy) VALUES (?, ?, ?, ?, ?, ?)',
        [studentId, classId, assignmentId, numericGrade, notes, req.user.id]
      );
      req.flash('success', 'تم إضافة الدرجة بنجاح');
    }

    res.redirect(`/classes/${classId}/assignments/${assignmentId}`);
  } catch (error) {
    console.error('Error saving grade:', error);
    req.flash('error', 'حدث خطأ أثناء حفظ الدرجة');
    res.redirect('back');
  }
});

// Delete grade (admin/teacher only)
router.delete('/:id', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const grade = await req.db.get('SELECT * FROM grades WHERE id = ?', [req.params.id]);
    
    if (!grade) {
      req.flash('error', 'الدرجة غير موجودة');
      return res.redirect('/grades');
    }

    await req.db.run('DELETE FROM grades WHERE id = ?', [req.params.id]);
    
    req.flash('success', 'تم حذف الدرجة بنجاح');
    res.redirect('back');
  } catch (error) {
    console.error('Error deleting grade:', error);
    req.flash('error', 'حدث خطأ أثناء حذف الدرجة');
    res.redirect('back');
  }
});

// Export grades to Excel (admin/teacher only)
router.get('/export/excel/:classId?', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { classId } = req.params;
    let query = `
      SELECT s.name as studentName, c.name as className, 
             a.title as assignmentTitle, g.grade, g.notes,
             u.name as gradedByName, g.gradedAt
      FROM grades g
      JOIN users s ON g.studentId = s.id
      JOIN classes c ON g.classId = c.id
      JOIN users u ON g.gradedBy = u.id
      LEFT JOIN assignments a ON g.assignmentId = a.id
    `;
    
    const params = [];
    if (classId) {
      query += ' WHERE g.classId = ?';
      params.push(classId);
    }
    
    query += ' ORDER BY c.name, s.name, g.gradedAt DESC';
    
    const grades = await req.db.all(query, params);
    
    // In a real implementation, you would use a library like exceljs or xlsx
    // to generate an Excel file. For now, we'll just return the data as JSON.
    // You can implement the actual Excel generation in a separate function.
    
    res.json({
      success: true,
      count: grades.length,
      data: grades
    });
  } catch (error) {
    console.error('Error exporting grades:', error);
    req.flash('error', 'حدث خطأ أثناء تصدير الدرجات');
    res.redirect('back');
  }
});

// View class grades (admin/teacher)
router.get('/class/:classId', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const classInfo = await req.db.get('SELECT * FROM classes WHERE id = ?', [req.params.classId]);
    if (!classInfo) {
      req.flash('error', 'الفصل غير موجود');
      return res.redirect('/classes');
    }

    // Get all students in the class
    const students = await req.db.all(`
      SELECT u.id, u.name, u.email
      FROM user_classes uc
      JOIN users u ON uc.userId = u.id
      WHERE uc.classId = ? AND u.role = 'student'
      ORDER BY u.name
    `, [req.params.classId]);

    // Get all assignments for this class
    const assignments = await req.db.all(`
      SELECT id, title, totalMarks, dueDate
      FROM assignments
      WHERE classId = ?
      ORDER BY dueDate
    `, [req.params.classId]);

    // Get grades for all students and assignments
    const grades = await req.db.all(`
      SELECT studentId, assignmentId, grade
      FROM grades
      WHERE classId = ?
    `, [req.params.classId]);

    // Organize grades by student and assignment
    const gradeMap = {};
    grades.forEach(grade => {
      if (!gradeMap[grade.studentId]) {
        gradeMap[grade.studentId] = {};
      }
      gradeMap[grade.studentId][grade.assignmentId] = grade.grade;
    });

    // Calculate averages
    const averages = students.map(student => {
      const studentGrades = gradeMap[student.id] || {};
      const gradesList = Object.values(studentGrades);
      const sum = gradesList.reduce((acc, g) => acc + g, 0);
      const average = gradesList.length > 0 ? (sum / gradesList.length).toFixed(2) : 'N/A';
      return { studentId: student.id, average };
    });

    res.render('grades/class', {
      title: `درجات فصل ${classInfo.name}`,
      classInfo,
      students,
      assignments,
      gradeMap,
      averages
    });
  } catch (error) {
    console.error('Error fetching class grades:', error);
    req.flash('error', 'حدث خطأ أثناء جلب درجات الفصل');
    res.redirect(`/classes/${req.params.classId}`);
  }
});

module.exports = router;
