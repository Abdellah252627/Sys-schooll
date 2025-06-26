const translations = {
    en: {
        // Common
        'app_name': 'School Management System',
        'toggle_sidebar': 'Toggle Sidebar',
        'search_placeholder': 'Search...',
        'view_all': 'View All',
        'today': 'Today',
        
        // Navigation
        'dashboard': 'Dashboard',
        'students': 'Students',
        'teachers': 'Teachers',
        'attendance': 'Attendance',
        'grades': 'Grades',
        'schedule': 'Schedule',
        'settings': 'Settings',
        
        // Stats Cards
        'total_students': 'Total Students',
        'total_teachers': 'Total Teachers',
        'attendance_rate': 'Attendance Rate',
        'pending_tasks': 'Pending Tasks',
        
        // Calendar
        'school_calendar': 'School Calendar',
        'prev_month': 'Previous',
        'next_month': 'Next',
        
        // Notifications
        'notifications': 'Notifications',
        'staff_meeting': 'Staff Meeting',
        'meeting_message': 'There will be a staff meeting tomorrow at 10 AM',
        'assignment_due': 'Assignment Due',
        'math_assignment': 'Math assignment is due tomorrow',
        'system_update': 'System Update',
        'update_message': 'System has been updated to version 2.0.1',
        
        // Upcoming Events
        'upcoming_events': 'Upcoming Events',
        'math_exam': 'Math Exam',
        'parent_meeting': 'Parent Meeting',
        'school_trip': 'School Trip',
        'view_calendar': 'View Calendar',
        
        // Time indicators
        'hours_ago': 'hours ago',
        'days_ago': 'days ago',
        'at': 'at',
        
        // User menu
        'profile': 'Profile',
        'logout': 'Logout',
        'language': 'Language',
        'arabic': 'Arabic',
        'english': 'English'
    },
    ar: {
        // Common
        'app_name': 'نظام إدارة المدرسة',
        'toggle_sidebar': 'تبديل القائمة الجانبية',
        'search_placeholder': 'بحث...',
        'view_all': 'عرض الكل',
        'today': 'اليوم',
        
        // Navigation
        'dashboard': 'الرئيسية',
        'students': 'الطلاب',
        'teachers': 'المعلمين',
        'attendance': 'الحضور',
        'grades': 'الدرجات',
        'schedule': 'الجدول',
        'settings': 'الإعدادات',
        
        // Stats Cards
        'total_students': 'إجمالي الطلاب',
        'total_teachers': 'إجمالي المعلمين',
        'attendance_rate': 'نسبة الحضور',
        'pending_tasks': 'المهام المعلقة',
        
        // Calendar
        'school_calendar': 'التقويم المدرسي',
        'prev_month': 'السابق',
        'next_month': 'التالي',
        
        // Notifications
        'notifications': 'الإشعارات',
        'staff_meeting': 'اجتماع هيئة التدريس',
        'meeting_message': 'سيتم عقد اجتماع هيئة التدريس غداً الساعة 10 صباحاً',
        'assignment_due': 'تسليم الواجبات',
        'math_assignment': 'الموعد النهائي لتسليم واجب مادة الرياضيات غداً',
        'system_update': 'تحديث النظام',
        'update_message': 'تم تحديث النظام إلى الإصدار 2.0.1',
        
        // Upcoming Events
        'upcoming_events': 'الأحداث القادمة',
        'math_exam': 'اختبار الرياضيات',
        'parent_meeting': 'اجتماع أولياء الأمور',
        'school_trip': 'رحلة مدرسية',
        'view_calendar': 'عرض التقويم',
        
        // Time indicators
        'hours_ago': 'منذ ساعات',
        'days_ago': 'منذ أيام',
        'at': 'في',
        
        // User menu
        'profile': 'الملف الشخصي',
        'logout': 'تسجيل الخروج',
        'language': 'اللغة',
        'arabic': 'العربية',
        'english': 'الإنجليزية'
    }
};

// Function to get translation
function t(key, lang = 'ar') {
    return translations[lang]?.[key] || key;
}

// Function to get all translations for a specific language
function getAllTranslations(lang = 'ar') {
    return translations[lang] || {};
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    // For Node.js
    module.exports = { t, getAllTranslations };
} else {
    // For browser
    window.translations = { t, getAllTranslations };
}
