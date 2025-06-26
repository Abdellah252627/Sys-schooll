// Initialize variables
let currentDate = new Date();
const dashboardApp = document.getElementById('dashboard-app');

// Translation function (falls back to key if translation not found)
function t(key, params = {}) {
    if (window.translations && window.translations.t) {
        return window.translations.t(key, document.documentElement.lang || 'ar', params);
    }
    return key;
}

// Initialize calendar
function initCalendar() {
    const lang = document.documentElement.lang || 'ar';
    
    // Use flatpickr for date selection
    flatpickr("#datePicker", {
        inline: true,
        locale: lang,
        defaultDate: currentDate,
        onChange: function(selectedDates) {
            currentDate = selectedDates[0];
            updateCalendar();
        }
    });
    
    updateCalendar();
}

// Update calendar display
function updateCalendar() {
    const lang = document.documentElement.lang || 'ar';
    let dayName, monthName;
    
    if (lang === 'ar') {
        const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        dayName = days[currentDate.getDay()];
        monthName = months[currentDate.getMonth()];
    } else {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        dayName = days[currentDate.getDay()];
        monthName = months[currentDate.getMonth()];
    }
    
    const dayNumber = currentDate.getDate();
    const year = currentDate.getFullYear();
    
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = lang === 'ar' 
            ? `${dayName}، ${dayNumber} ${monthName} ${year}`
            : `${dayName}, ${monthName} ${dayNumber}, ${year}`;
    }
}

// Load statistics
function loadStats() {
    // Sample data for display
    const stats = [
        { 
            title: t('total_students'),
            value: '1,245', 
            change: '+12.5%', 
            isPositive: true,
            icon: 'users',
            color: '#4361ee'
        },
        { 
            title: t('total_teachers'),
            value: '48', 
            change: '+4.2%', 
            isPositive: true,
            icon: 'chalkboard-teacher',
            color: '#4cc9f0'
        },
        { 
            title: t('attendance_rate'),
            value: '94%', 
            change: '+2.1%', 
            isPositive: true,
            icon: 'clipboard-check',
            color: '#4caf50'
        },
        { 
            title: t('pending_tasks'),
            value: '23', 
            change: '-3', 
            isPositive: false,
            icon: 'tasks',
            color: '#f44336'
        }
    ];
    
    const statsContainer = document.createElement('div');
    statsContainer.className = 'stats-container';
    
    stats.forEach(stat => {
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';
        statCard.style.borderTop = `4px solid ${stat.color}`;
        
        statCard.innerHTML = `
            <i class="fas fa-${stat.icon}" style="color: ${stat.color}"></i>
            <h3>${stat.title}</h3>
            <div class="value">${stat.value}</div>
            <div class="change ${stat.isPositive ? 'positive' : 'negative'}">
                ${stat.change}
                <i class="fas fa-${stat.isPositive ? 'arrow-up' : 'arrow-down'}"></i>
            </div>
        `;
        
        statsContainer.appendChild(statCard);
    });
    
    return statsContainer;
}

// Load notifications
function loadNotifications() {
    // Sample data for display
    const notifications = [
        {
            title: t('staff_meeting'),
            message: t('meeting_message'),
            time: t('hours_ago', {count: 2}),
            icon: 'users',
            type: 'info'
        },
        {
            title: t('assignment_due'),
            message: t('math_assignment'),
            time: t('hours_ago', {count: 5}),
            icon: 'tasks',
            type: 'warning'
        },
        {
            title: t('system_update'),
            message: t('update_message'),
            time: t('days_ago', {count: 1}),
            icon: 'sync',
            type: 'success'
        }
    ];
    
    const notificationsList = document.createElement('div');
    notificationsList.className = 'notifications-container';
    
    const header = document.createElement('div');
    header.className = 'notifications-header';
    header.innerHTML = `
        <h2>${t('notifications')}</h2>
        <a href="#">${t('view_all')}</a>
    `;
    
    const list = document.createElement('ul');
    list.className = 'notification-list';
    
    notifications.forEach(notif => {
        const item = document.createElement('li');
        item.className = 'notification-item';
        
        item.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${notif.icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notif.title}</div>
                <div class="notification-message">${notif.message}</div>
                <div class="notification-time">${notif.time}</div>
            </div>
        `;
        
        list.appendChild(item);
    });
    
    notificationsList.appendChild(header);
    notificationsList.appendChild(list);
    
    return notificationsList;
}

// Load upcoming events
function loadUpcomingEvents() {
    // Sample data for display
    const events = [
        {
            title: t('math_exam'),
            date: document.documentElement.lang === 'ar' ? '15 يونيو' : 'Jun 15',
            time: document.documentElement.lang === 'ar' ? '09:00 - 10:30 ص' : '09:00 - 10:30 AM',
            type: 'exam'
        },
        {
            title: t('parent_meeting'),
            date: document.documentElement.lang === 'ar' ? '20 يونيو' : 'Jun 20',
            time: document.documentElement.lang === 'ar' ? '03:00 - 05:00 م' : '03:00 - 05:00 PM',
            type: 'meeting'
        },
        {
            title: t('school_trip'),
            date: document.documentElement.lang === 'ar' ? '25 يونيو' : 'Jun 25',
            time: document.documentElement.lang === 'ar' ? '08:00 - 02:00 م' : '08:00 AM - 02:00 PM',
            type: 'trip'
        }
    ];
    
    const eventsContainer = document.createElement('div');
    eventsContainer.className = 'events-container';
    eventsContainer.style.background = 'white';
    eventsContainer.style.borderRadius = '10px';
    eventsContainer.style.padding = '20px';
    eventsContainer.style.margin = '0 25px 25px';
    eventsContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
    
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '20px';
    
    header.innerHTML = `
        <h2 style="font-size: 1.3rem; color: #2d3436;">الأحداث القادمة</h2>
        <a href="#" style="color: #4361ee; text-decoration: none; font-size: 0.9rem;">عرض التقويم</a>
    `;
    
    const eventsList = document.createElement('div');
    eventsList.className = 'events-list';
    
    events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.style.display = 'flex';
        eventElement.style.alignItems = 'center';
        eventElement.style.padding = '12px 0';
        eventElement.style.borderBottom = '1px solid #e0e0e0';
        
        const icon = document.createElement('div');
        icon.style.width = '40px';
        icon.style.height = '40px';
        icon.style.borderRadius = '8px';
        icon.style.background = '#e3f2fd';
        icon.style.display = 'flex';
        icon.style.alignItems = 'center';
        icon.style.justifyContent = 'center';
        icon.style.marginLeft = '15px';
        icon.style.color = '#4361ee';
        
        let iconClass = 'calendar-alt';
        if (event.type === 'exam') iconClass = 'file-alt';
        else if (event.type === 'meeting') iconClass = 'users';
        else if (event.type === 'trip') iconClass = 'bus';
        
        icon.innerHTML = `<i class="fas fa-${iconClass}"></i>`;
        
        const eventInfo = document.createElement('div');
        eventInfo.style.flex = '1';
        
        const eventTitle = document.createElement('div');
        eventTitle.textContent = event.title;
        eventTitle.style.fontWeight = '500';
        eventTitle.style.marginBottom = '4px';
        
        const eventMeta = document.createElement('div');
        eventMeta.style.display = 'flex';
        eventMeta.style.gap = '15px';
        eventMeta.style.fontSize = '0.85rem';
        eventMeta.style.color = '#777';
        
        const eventDate = document.createElement('div');
        eventDate.innerHTML = `<i class="far fa-calendar-alt" style="margin-left: 5px;"></i> ${event.date}`;
        
        const eventTime = document.createElement('div');
        eventTime.innerHTML = `<i class="far fa-clock" style="margin-left: 5px;"></i> ${event.time}`;
        
        eventMeta.appendChild(eventDate);
        eventMeta.appendChild(eventTime);
        
        eventInfo.appendChild(eventTitle);
        eventInfo.appendChild(eventMeta);
        
        eventElement.appendChild(icon);
        eventElement.appendChild(eventInfo);
        
        eventsList.appendChild(eventElement);
    });
    
    eventsContainer.appendChild(header);
    eventsContainer.appendChild(eventsList);
    
    return eventsContainer;
}

// تحميل لوحة التحكم
function loadDashboard() {
    // إضافة بطاقات الإحصائيات
    dashboardApp.appendChild(loadStats());
    
    // إضافة صف يحتوي على التقويم والإشعارات
    const row = document.createElement('div');
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '1fr 1fr';
    row.style.gap = '20px';
    row.style.padding = '0 25px 25px';
    
    // إضافة التقويم
    const calendarContainer = document.createElement('div');
    calendarContainer.className = 'calendar-container';
    calendarContainer.innerHTML = `
        <div class="calendar-header">
            <h2>${t('school_calendar')}</h2>
            <div class="calendar-actions">
                <button id="prevMonth">
                    <i class="fas fa-chevron-${document.documentElement.dir === 'rtl' ? 'right' : 'left'}"></i>
                </button>
                <button id="today">${t('today')}</button>
                <button id="nextMonth">
                    <i class="fas fa-chevron-${document.documentElement.dir === 'rtl' ? 'left' : 'right'}"></i>
                </button>
            </div>
        </div>
        <div id="currentDate" style="font-weight: 500; margin-bottom: 15px;"></div>
        <div id="datePicker"></div>
    `;
    
    // إضافة الإشعارات
    const notificationsContainer = loadNotifications();
    
    row.appendChild(calendarContainer);
    row.appendChild(notificationsContainer);
    
    dashboardApp.appendChild(row);
    
    // إضافة الأحداث القادمة
    dashboardApp.appendChild(loadUpcomingEvents());
    
    // تهيئة التقويم
    initCalendar();
    
    // إضافة معالجات الأحداث
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar();
    });
    
    document.getElementById('today').addEventListener('click', () => {
        currentDate = new Date();
        updateCalendar();
    });
}

// Load page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add menu toggle for mobile
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    menuToggle.setAttribute('aria-label', t('toggle_sidebar'));
    
    menuToggle.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
    });
    
    document.body.appendChild(menuToggle);
    
    // Load dashboard
    loadDashboard();
    
    // Listen for language changes
    document.addEventListener('languageChange', () => {
        // Re-render the dashboard when language changes
        dashboardApp.innerHTML = '';
        loadDashboard();
    });
});