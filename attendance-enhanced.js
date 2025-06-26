// Enhanced Attendance System with Barcode Scanning and Parent Notifications

// Initialize variables
let scanner = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// DOM Elements
const scanBtn = document.getElementById('scanBtn');
const video = document.getElementById('scanner');
const scanResult = document.getElementById('scanResult');
const attendanceForm = document.getElementById('attendanceForm');
const attendanceTable = document.getElementById('attendanceTable');
const monthYearDisplay = document.getElementById('monthYear');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const reportBtn = document.getElementById('generateReport');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Set default date to today
    document.getElementById('date').valueAsDate = new Date();
    
    // Load attendance records
    renderAttendanceTable();
    updateMonthYearDisplay();
    
    // Initialize event listeners
    if (scanBtn) {
        scanBtn.addEventListener('click', toggleScanner);
    }
    
    if (attendanceForm) {
        attendanceForm.addEventListener('submit', handleAttendanceSubmit);
    }
    
    if (prevMonthBtn && nextMonthBtn) {
        prevMonthBtn.addEventListener('click', () => changeMonth(-1));
        nextMonthBtn.addEventListener('click', () => changeMonth(1));
    }
    
    if (reportBtn) {
        reportBtn.addEventListener('click', generateMonthlyReport);
    }
});

// Toggle barcode/QR code scanner
async function toggleScanner() {
    if (!scanner) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            
            video.srcObject = stream;
            await video.play();
            
            // Initialize barcode detector
            const barcodeDetector = new BarcodeDetector({ formats: ['qr_code', 'code_128', 'code_39'] });
            
            scanner = setInterval(async () => {
                try {
                    const barcodes = await barcodeDetector.detect(video);
                    if (barcodes.length > 0) {
                        const studentId = barcodes[0].rawValue;
                        handleScannedCode(studentId);
                        stopScanner();
                    }
                } catch (err) {
                    console.error('Barcode detection error:', err);
                }
            }, 500);
            
            scanBtn.textContent = 'إيقاف المسح';
            scanResult.textContent = 'يتم الآن مسح الرمز...';
            
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('حدث خطأ في تشغيل الكاميرا. يرجى التأكد من السماح بالوصول للكاميرا.');
        }
    } else {
        stopScanner();
    }
}

// Stop the scanner
function stopScanner() {
    if (scanner) {
        clearInterval(scanner);
        scanner = null;
    }
    
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    
    if (scanBtn) {
        scanBtn.textContent = 'مسح الباركود';
    }
}

// Handle scanned barcode/QR code
function handleScannedCode(studentId) {
    // In a real app, you would fetch student details from your database
    const student = getStudentById(studentId);
    
    if (student) {
        document.getElementById('studentId').value = studentId;
        document.getElementById('studentName').value = student.name;
        document.getElementById('studentClass').value = student.class;
        scanResult.textContent = `تم التعرف على الطالب: ${student.name}`;
    } else {
        scanResult.textContent = 'لم يتم العثور على الطالب';
    }
}

// Handle attendance form submission
function handleAttendanceSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(attendanceForm);
    const attendance = {
        id: Date.now(),
        studentId: formData.get('studentId'),
        studentName: formData.get('studentName'),
        studentClass: formData.get('studentClass'),
        status: formData.get('status'),
        date: formData.get('date'),
        time: formData.get('time'),
        notes: formData.get('notes'),
        recordedBy: 'المستخدم الحالي' // In a real app, get from auth system
    };
    
    // Save to local storage
    saveAttendance(attendance);
    
    // Send notification to parent if absent
    if (attendance.status === 'absent') {
        sendParentNotification(attendance);
    }
    
    // Reset form and update table
    attendanceForm.reset();
    renderAttendanceTable();
    
    // Show success message
    alert('تم تسجيل الحضور بنجاح');
}

// Save attendance to local storage
function saveAttendance(attendance) {
    const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    records.push(attendance);
    localStorage.setItem('attendanceRecords', JSON.stringify(records));
}

// Get attendance records (filtered by month/year if specified)
function getAttendanceRecords(month = null, year = null) {
    let records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    
    if (month !== null && year !== null) {
        records = records.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.getMonth() === month && recordDate.getFullYear() === year;
        });
    }
    
    return records;
}

// Render attendance table
function renderAttendanceTable() {
    const records = getAttendanceRecords(currentMonth, currentYear);
    const tbody = attendanceTable.querySelector('tbody');
    
    tbody.innerHTML = records.map(record => `
        <tr>
            <td>${formatDate(record.date)}</td>
            <td>${record.studentName}</td>
            <td>${record.studentClass}</td>
            <td class="status-${record.status}">${getStatusText(record.status)}</td>
            <td>${record.notes || '-'}</td>
            <td>${record.recordedBy}</td>
        </tr>
    `).join('');
    
    // Update absence statistics
    updateAbsenceStats(records);
}

// Update month/year display
function updateMonthYearDisplay() {
    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    if (monthYearDisplay) {
        monthYearDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }
}

// Change month for attendance view
function changeMonth(direction) {
    currentMonth += direction;
    
    // Handle year change
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    
    updateMonthYearDisplay();
    renderAttendanceTable();
}

// Generate monthly attendance report
function generateMonthlyReport() {
    const records = getAttendanceRecords(currentMonth, currentYear);
    
    if (records.length === 0) {
        alert('لا توجد سجلات حضور لهذا الشهر');
        return;
    }
    
    // Group by student
    const students = {};
    records.forEach(record => {
        if (!students[record.studentId]) {
            students[record.studentId] = {
                name: record.studentName,
                class: record.studentClass,
                present: 0,
                absent: 0,
                late: 0,
                total: 0
            };
        }
        
        students[record.studentId][record.status]++;
        students[record.studentId].total++;
    });
    
    // Create CSV content
    let csv = 'اسم الطالب,الصف,عدد أيام الحضور,عدد أيام الغياب,عدد أيام التأخير,إجمالي الأيام\n';
    
    Object.values(students).forEach(student => {
        csv += `"${student.name}",${student.class},${student.present || 0},${student.absent || 0},${student.late || 0},${student.total}\n`;
    });
    
    // Create download link
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير الحضور_${currentMonth + 1}_${currentYear}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Send notification to parent about student absence
function sendParentNotification(attendance) {
    // In a real app, this would send an SMS/email to the parent
    const notification = {
        studentId: attendance.studentId,
        studentName: attendance.studentName,
        date: attendance.date,
        status: attendance.status,
        message: `تنبيه: ${attendance.studentName} تغيب عن المدرسة في ${formatDate(attendance.date)}`,
        sentAt: new Date().toISOString(),
        read: false
    };
    
    // Save notification (in a real app, this would be sent to a server)
    const notifications = JSON.parse(localStorage.getItem('parentNotifications') || '[]');
    notifications.push(notification);
    localStorage.setItem('parentNotifications', JSON.stringify(notifications));
    
    console.log('Parent notification sent:', notification);
}

// Helper function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
}

// Helper function to get status text
function getStatusText(status) {
    const statuses = {
        present: 'حاضر',
        absent: 'غائب',
        late: 'متأخر',
        excused: 'بعذر'
    };
    
    return statuses[status] || status;
}

// Helper function to get student by ID (mock function)
function getStudentById(studentId) {
    // In a real app, this would fetch from your database
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    return students.find(s => s.id === studentId || s.studentId === studentId);
}

// Helper function to update absence statistics
function updateAbsenceStats(records) {
    const stats = {
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        total: records.length
    };
    
    records.forEach(record => {
        if (stats.hasOwnProperty(record.status)) {
            stats[record.status]++;
        }
    });
    
    // Update UI with stats (assuming you have elements with these IDs)
    const updateStat = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };
    
    updateStat('stat-present', stats.present);
    updateStat('stat-absent', stats.absent);
    updateStat('stat-late', stats.late);
    updateStat('stat-excused', stats.excused);
    updateStat('stat-total', stats.total);
}
