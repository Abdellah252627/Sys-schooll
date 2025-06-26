// Grades Management Logic

// Save or update grade
function saveGrade(studentName, subject, grade, teacherName) {
    let grades = JSON.parse(localStorage.getItem('grades')) || [];
    // Check if grade exists for this student and subject
    const idx = grades.findIndex(g => g.studentName === studentName && g.subject === subject);
    if (idx !== -1) {
        grades[idx] = {studentName, subject, grade, teacherName};
    } else {
        grades.push({studentName, subject, grade, teacherName});
    }
    localStorage.setItem('grades', JSON.stringify(grades));
}

// Get all grades
function getAllGrades() {
    return JSON.parse(localStorage.getItem('grades')) || [];
}

// Get grades for a specific student
function getStudentGrades(studentName) {
    return getAllGrades().filter(g => g.studentName === studentName);
}

// Get grades entered by a specific teacher
function getTeacherGrades(teacherName) {
    return getAllGrades().filter(g => g.teacherName === teacherName);
}