const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Get all classes
router.get('/', protect, async (req, res) => {
  try {
    const classes = await req.db.all(`
      SELECT c.*, u.name as teacherName 
      FROM classes c 
      LEFT JOIN users u ON c.teacherId = u.id
      ORDER BY c.grade, c.name
    `);
    
    res.render('classes/index', {
      title: 'الفصول الدراسية',
      classes
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    req.flash('error', 'حدث خطأ أثناء جلب بيانات الفصول');
    res.redirect('/dashboard');
  }
});

// Get class details
router.get('/:id', protect, async (req, res) => {
  try {
    const classData = await req.db.get(`
      SELECT c.*, u.name as teacherName 
      FROM classes c 
      LEFT JOIN users u ON c.teacherId = u.id 
      WHERE c.id = ?
    `, [req.params.id]);

    if (!classData) {
      req.flash('error', 'الفصل غير موجود');
      return res.redirect('/classes');
    }

    // Get students in this class
    const students = await req.db.all(`
      SELECT u.id, u.name, u.email, u.avatar 
      FROM user_classes uc 
      JOIN users u ON uc.userId = u.id 
      WHERE uc.classId = ? AND u.role = 'student'
    `, [req.params.id]);

    // Get assignments for this class
    const assignments = await req.db.all(`
      SELECT * FROM assignments 
      WHERE classId = ? 
      ORDER BY dueDate DESC
    `, [req.params.id]);

    res.render('classes/view', {
      title: `الصف ${classData.grade} - ${classData.name}`,
      class: classData,
      students,
      assignments
    });
  } catch (error) {
    console.error('Error fetching class:', error);
    req.flash('error', 'حدث خطأ أثناء جلب بيانات الفصل');
    res.redirect('/classes');
  }
});

// Create class form (admin/teacher only)
router.get('/new', protect, authorize('admin', 'teacher'), (req, res) => {
  res.render('classes/new', {
    title: 'إضافة فصل جديد'
  });
});

// Create new class
router.post('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { name, grade, section, academicYear, description } = req.body;
    
    const result = await req.db.run(
      'INSERT INTO classes (name, grade, section, academicYear, description, teacherId) VALUES (?, ?, ?, ?, ?, ?)',
      [name, grade, section, academicYear, description, req.user.id]
    );

    req.flash('success', 'تم إضافة الفصل بنجاح');
    res.redirect(`/classes/${result.lastID}`);
  } catch (error) {
    console.error('Error creating class:', error);
    req.flash('error', 'حدث خطأ أثناء إضافة الفصل');
    res.redirect('/classes/new');
  }
});

// Edit class form
router.get('/:id/edit', protect, async (req, res) => {
  try {
    const classData = await req.db.get('SELECT * FROM classes WHERE id = ?', [req.params.id]);
    
    if (!classData) {
      req.flash('error', 'الفصل غير موجود');
      return res.redirect('/classes');
    }

    // Check if user is authorized (admin or class teacher)
    if (req.user.role !== 'admin' && classData.teacherId !== req.user.id) {
      req.flash('error', 'غير مصرح لك بتعديل هذا الفصل');
      return res.redirect(`/classes/${req.params.id}`);
    }

    const teachers = await req.db.all("SELECT id, name FROM users WHERE role = 'teacher'");
    
    res.render('classes/edit', {
      title: 'تعديل الفصل',
      class: classData,
      teachers
    });
  } catch (error) {
    console.error('Error fetching class for edit:', error);
    req.flash('error', 'حدث خطأ أثناء تحميل صفحة التعديل');
    res.redirect(`/classes/${req.params.id}`);
  }
});

// Update class
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, grade, section, academicYear, description, teacherId } = req.body;
    
    // Check if class exists
    const existingClass = await req.db.get('SELECT * FROM classes WHERE id = ?', [req.params.id]);
    if (!existingClass) {
      req.flash('error', 'الفصل غير موجود');
      return res.redirect('/classes');
    }

    // Check if user is authorized (admin or class teacher)
    if (req.user.role !== 'admin' && existingClass.teacherId !== req.user.id) {
      req.flash('error', 'غير مصرح لك بتعديل هذا الفصل');
      return res.redirect(`/classes/${req.params.id}`);
    }

    await req.db.run(
      'UPDATE classes SET name = ?, grade = ?, section = ?, academicYear = ?, description = ?, teacherId = ? WHERE id = ?',
      [name, grade, section, academicYear, description, teacherId, req.params.id]
    );

    req.flash('success', 'تم تحديث بيانات الفصل بنجاح');
    res.redirect(`/classes/${req.params.id}`);
  } catch (error) {
    console.error('Error updating class:', error);
    req.flash('error', 'حدث خطأ أثناء تحديث بيانات الفصل');
    res.redirect(`/classes/${req.params.id}/edit`);
  }
});

// Delete class (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    // Check if class has students
    const hasStudents = await req.db.get(
      'SELECT COUNT(*) as count FROM user_classes WHERE classId = ?',
      [req.params.id]
    );

    if (hasStudents.count > 0) {
      req.flash('error', 'لا يمكن حذف الفصل لأنه يحتوي على طلاب');
      return res.redirect(`/classes/${req.params.id}`);
    }

    await req.db.run('DELETE FROM classes WHERE id = ?', [req.params.id]);
    
    req.flash('success', 'تم حذف الفصل بنجاح');
    res.redirect('/classes');
  } catch (error) {
    console.error('Error deleting class:', error);
    req.flash('error', 'حدث خطأ أثناء حذف الفصل');
    res.redirect(`/classes/${req.params.id}`);
  }
});

// Add student to class
router.post('/:id/students', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { studentId } = req.body;
    
    // Check if student is already in class
    const exists = await req.db.get(
      'SELECT * FROM user_classes WHERE userId = ? AND classId = ?',
      [studentId, req.params.id]
    );

    if (exists) {
      req.flash('error', 'الطالب مسجل بالفعل في هذا الفصل');
      return res.redirect(`/classes/${req.params.id}`);
    }

    await req.db.run(
      'INSERT INTO user_classes (userId, classId) VALUES (?, ?)',
      [studentId, req.params.id]
    );

    req.flash('success', 'تمت إضافة الطالب إلى الفصل بنجاح');
    res.redirect(`/classes/${req.params.id}`);
  } catch (error) {
    console.error('Error adding student to class:', error);
    req.flash('error', 'حدث خطأ أثناء إضافة الطالب إلى الفصل');
    res.redirect(`/classes/${req.params.id}`);
  }
});

// Remove student from class
router.delete('/:id/students/:studentId', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    await req.db.run(
      'DELETE FROM user_classes WHERE userId = ? AND classId = ?',
      [req.params.studentId, req.params.id]
    );

    req.flash('success', 'تمت إزالة الطالب من الفصل بنجاح');
    res.redirect(`/classes/${req.params.id}`);
  } catch (error) {
    console.error('Error removing student from class:', error);
    req.flash('error', 'حدث خطأ أثناء إزالة الطالب من الفصل');
    res.redirect(`/classes/${req.params.id}`);
  }
});

module.exports = router;
