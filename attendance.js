// Attendance Tracking Logic

// Save attendance record
function saveAttendance(date, studentName, status, teacherName) {
    let records = JSON.parse(localStorage.getItem('attendance')) || [];
    records.push({date, studentName, status, teacherName});
    localStorage.setItem('attendance', JSON.stringify(records));
}

// Get all attendance records
function getAttendanceRecords() {
    return JSON.parse(localStorage.getItem('attendance')) || [];
}

// Get attendance for a specific student
function getStudentAttendance(studentName) {
    return getAttendanceRecords().filter(r => r.studentName === studentName);
}

// Get attendance by teacher
function getTeacherAttendance(teacherName) {
    return getAttendanceRecords().filter(r => r.teacherName === teacherName);
}

// Admin can view all records
// Teachers can view their own records
// Students can view their own attendance