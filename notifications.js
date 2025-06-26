// Notifications System Logic
// This file will handle sending and displaying notifications for users (teachers, management, students, parents) using localStorage.

document.addEventListener('DOMContentLoaded', function() {
    const notificationForm = document.getElementById('notificationForm');
    const notificationsTableBody = document.querySelector('#notificationsTable tbody');

    function getNotifications() {
        return JSON.parse(localStorage.getItem('notifications') || '[]');
    }

    function saveNotifications(notifications) {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }

    function renderTable(notifications) {
        notificationsTableBody.innerHTML = '';
        notifications.forEach(n => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${n.sender}</td><td>${n.recipient || 'الجميع'}</td><td>${n.type}</td><td>${n.message}</td><td>${n.date}</td>`;
            notificationsTableBody.appendChild(tr);
        });
    }

    notificationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const sender = document.getElementById('sender').value.trim();
        const recipient = document.getElementById('recipient').value.trim();
        const type = document.getElementById('type').value;
        const message = document.getElementById('message').value.trim();
        const date = new Date().toLocaleString('ar-EG');
        if (!sender || !message) return;
        const notifications = getNotifications();
        notifications.unshift({ sender, recipient, type, message, date });
        saveNotifications(notifications);
        notificationForm.reset();
        renderTable(notifications);
    });

    // Initial render
    renderTable(getNotifications());
});