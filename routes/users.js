const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

// Get all users (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await req.db.all('SELECT id, name, email, role, isActive, createdAt FROM users');
    res.render('users/index', {
      title: 'إدارة المستخدمين',
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    req.flash('error', 'حدث خطأ أثناء جلب بيانات المستخدمين');
    res.redirect('/dashboard');
  }
});

// Get user profile
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await req.db.get(
      'SELECT id, name, email, role, phone, avatar, isActive, createdAt FROM users WHERE id = ?',
      [req.params.id]
    );

    if (!user) {
      req.flash('error', 'المستخدم غير موجود');
      return res.redirect('/users');
    }

    res.render('users/profile', {
      title: 'الملف الشخصي',
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    req.flash('error', 'حدث خطأ أثناء جلب بيانات المستخدم');
    res.redirect('/users');
  }
});

// Update user profile
router.put('/:id', protect, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.params.id;

    // Check if user is updating their own profile or is admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      req.flash('error', 'غير مصرح لك بتحديث هذا الملف الشخصي');
      return res.redirect(`/users/${userId}`);
    }

    const updateData = { name, email, phone };
    const params = [name, email, phone, userId];
    
    // If avatar is uploaded
    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
      params.unshift(updateData.avatar);
    }

    const setClause = Object.keys(updateData)
      .map((key, index) => `${key} = ?`)
      .join(', ');

    await req.db.run(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      [...Object.values(updateData), userId]
    );

    req.flash('success', 'تم تحديث الملف الشخصي بنجاح');
    res.redirect(`/users/${userId}`);
  } catch (error) {
    console.error('Error updating user:', error);
    req.flash('error', 'حدث خطأ أثناء تحديث الملف الشخصي');
    res.redirect(`/users/${req.params.id}`);
  }
});

// Delete user (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      req.flash('error', 'لا يمكنك حذف حسابك الشخصي');
      return res.redirect('/users');
    }

    await req.db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
    req.flash('success', 'تم حذف المستخدم بنجاح');
    res.redirect('/users');
  } catch (error) {
    console.error('Error deleting user:', error);
    req.flash('error', 'حدث خطأ أثناء حذف المستخدم');
    res.redirect('/users');
  }
});

module.exports = router;
