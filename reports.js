// Reports and Analytics Logic
// This file will generate and display reports on student performance, attendance, classes, and more using localStorage data.

function generatePerformanceReport() {
    const grades = JSON.parse(localStorage.getItem('grades') || '[]');
    let html = '<h3>تقرير أداء الطلاب</h3>';
    if (grades.length === 0) {
        html += '<p>لا توجد بيانات درجات.</p>';
    } else {
        html += '<table><thead><tr><th>اسم الطالب</th><th>المادة</th><th>الدرجة</th><th>المعلم</th></tr></thead><tbody>';
        grades.forEach(g => {
            html += `<tr><td>${g.studentName}</td><td>${g.subject}</td><td>${g.grade}</td><td>${g.teacherName}</td></tr>`;
        });
        html += '</tbody></table>';
    }
    document.getElementById('reportContainer').innerHTML = html;
}

function generateAttendanceReport() {
    const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
    let html = '<h3>تقرير الحضور</h3>';
    if (attendance.length === 0) {
        html += '<p>لا توجد بيانات حضور.</p>';
    } else {
        html += '<table><thead><tr><th>اسم الطالب</th><th>الحالة</th><th>المعلم</th><th>التاريخ</th></tr></thead><tbody>';
        attendance.forEach(a => {
            html += `<tr><td>${a.studentName}</td><td>${a.status}</td><td>${a.teacherName}</td><td>${a.date}</td></tr>`;
        });
        html += '</tbody></table>';
    }
    document.getElementById('reportContainer').innerHTML = html;
}

function generateClassReport() {
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    let html = '<h3>تقرير الفصول</h3>';
    if (classes.length === 0) {
        html += '<p>لا توجد بيانات فصول.</p>';
    } else {
        html += '<table><thead><tr><th>اسم الفصل</th><th>عدد الطلاب</th></tr></thead><tbody>';
        classes.forEach(c => {
            html += `<tr><td>${c.className}</td><td>${c.students ? c.students.length : 0}</td></tr>`;
        });
        html += '</tbody></table>';
    }
    document.getElementById('reportContainer').innerHTML = html;
}

function exportReport(type) {
    const container = document.getElementById('reportContainer');
    if (!container.innerHTML) {
        alert('يرجى توليد تقرير أولاً.');
        return;
    }
    if (type === 'pdf') {
        exportToPDF(container.innerHTML);
    } else if (type === 'excel') {
        exportToExcel(container.innerHTML);
    }
}

function exportToPDF(htmlContent) {
    const win = window.open('', '', 'width=800,height=600');
    win.document.write('<html><head><title>تقرير PDF</title></head><body>' + htmlContent + '</body></html>');
    win.document.close();
    win.print();
}

function exportToExcel(htmlContent) {
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.xls';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', function() {
    const fileUpload = document.getElementById('fileUpload');
    if (fileUpload) {
        fileUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                alert('تم رفع الملف: ' + file.name);
                // You can add logic here to parse or process the file if needed
            }
        });
    }
});