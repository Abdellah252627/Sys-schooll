const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');
const userRoutes = require('./users');
const classRoutes = require('./classes');
const assignmentRoutes = require('./assignments');
const gradeRoutes = require('./grades');
const uploadRoutes = require('./uploads');

// Mount routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);
router.use('/classes', classRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/grades', gradeRoutes);
router.use('/uploads', uploadRoutes);

// Home route
router.get('/', (req, res) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }
  res.render('home', { title: 'الرئيسية' });
});

// 404 handler
router.use((req, res) => {
  res.status(404).render('error', {
    title: '404 - الصفحة غير موجودة',
    message: 'عذراً، الصفحة المطلوبة غير موجودة'
  });
});

// Error handler
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'خطأ في الخادم',
    message: 'حدث خطأ ما في الخادم. يرجى المحاولة مرة أخرى لاحقاً.'
  });
});

module.exports = router;
