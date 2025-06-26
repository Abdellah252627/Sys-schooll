const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Dashboard home
router.get('/', protect, (req, res) => {
  // Sample data for the dashboard
  const dashboardData = {
    stats: {
      students: 248,
      teachers: 24,
      classes: 12,
      assignments: 18
    },
    recentActivities: [
      {
        title: 'تم تسجيل واجب جديد',
        description: 'تم إضافة واجب الرياضيات للصف الأول الثانوي',
        time: 'منذ ساعتين',
        link: '/assignments/1'
      },
      {
        title: 'تم تسجيل درجات جديدة',
        description: 'تم تسجيل درجات اختبار الفيزياء',
        time: 'منذ يوم',
        link: '/grades/1'
      },
      {
        title: 'تم إضافة طالب جديد',
        description: 'تم تسجيل الطالب أحمد محمد',
        time: 'منذ يومين',
        link: '/students/1'
      }
    ],
    upcomingEvents: [
      {
        title: 'اجتماع أولياء الأمور',
        description: 'اجتماع أولياء أمور طلاب الصف الأول الثانوي',
        date: '2023-10-15',
        time: '04:00 م',
        location: 'قاعة الاجتماعات',
        link: '/events/1'
      },
      {
        title: 'اختبار الرياضيات',
        description: 'اختبار الفصل الأول في مادة الرياضيات',
        date: '2023-10-20',
        time: '09:00 ص',
        location: 'الفصل 101',
        link: '/exams/1'
      }
    ]
  };

  res.render('dashboard/index', {
    title: 'لوحة التحكم',
    user: req.user,
    ...dashboardData
  });
});

// Dashboard settings
router.get('/settings', protect, (req, res) => {
  res.render('dashboard/settings', {
    title: 'إعدادات الحساب',
    user: req.user
  });
});

// Profile page
router.get('/profile', protect, (req, res) => {
  res.render('dashboard/profile', {
    title: 'الملف الشخصي',
    user: req.user
  });
});

// Admin dashboard (protected admin route)
router.get('/admin', protect, authorize('admin'), (req, res) => {
  res.render('dashboard/admin', {
    title: 'لوحة تحكم المدير',
    user: req.user
  });
});

module.exports = router;
