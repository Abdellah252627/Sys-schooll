// Schedule Management Logic
// This file will handle timetable data for students and teachers using localStorage.

document.addEventListener('DOMContentLoaded', function() {
    const scheduleForm = document.getElementById('scheduleForm');
    const scheduleTableBody = document.querySelector('#scheduleTable tbody');
    const searchName = document.getElementById('searchName');

    function getSchedules() {
        return JSON.parse(localStorage.getItem('schedules') || '[]');
    }

    function saveSchedules(schedules) {
        localStorage.setItem('schedules', JSON.stringify(schedules));
    }

    function renderTable(schedules) {
        scheduleTableBody.innerHTML = '';
        schedules.forEach(sch => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${sch.personName}</td><td>${sch.day}</td><td>${sch.subject}</td><td>${sch.time}</td>`;
            scheduleTableBody.appendChild(tr);
        });
    }

    function filterSchedule() {
        const name = searchName.value.trim();
        const schedules = getSchedules();
        if (name) {
            renderTable(schedules.filter(sch => sch.personName.includes(name)));
        } else {
            renderTable(schedules);
        }
    }

    window.filterSchedule = filterSchedule;

    scheduleForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const personName = document.getElementById('personName').value.trim();
        const day = document.getElementById('day').value;
        const subject = document.getElementById('subject').value.trim();
        const time = document.getElementById('time').value.trim();
        if (!personName || !subject || !time) return;
        const schedules = getSchedules();
        schedules.push({ personName, day, subject, time });
        saveSchedules(schedules);
        scheduleForm.reset();
        renderTable(schedules);
    });

    // Initial render
    renderTable(getSchedules());
});