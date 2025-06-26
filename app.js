// Simple School Management System
// Data will be stored in localStorage for demo purposes

const app = document.getElementById('app');

// Utility functions for localStorage
function getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}
function setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Render main menu
function renderMenu() {
    app.innerHTML = `
        <button onclick="renderStudents()">Manage Students</button>
        <button onclick="renderClasses()">Manage Classes</button>
    `;
}

// Students Section
function renderStudents() {
    const students = getData('students');
    app.innerHTML = `
        <h2>Students</h2>
        <form id="studentForm">
            <input type="text" id="studentName" placeholder="Student Name" required />
            <input type="text" id="studentClass" placeholder="Class" required />
            <button type="submit">Add Student</button>
        </form>
        <button onclick="renderMenu()">Back</button>
        <table>
            <tr><th>Name</th><th>Class</th><th>Actions</th></tr>
            ${students.map((s, i) => `<tr><td>${s.name}</td><td>${s.class}</td><td><button onclick="deleteStudent(${i})">Delete</button></td></tr>`).join('')}
        </table>
    `;
    document.getElementById('studentForm').onsubmit = function(e) {
        e.preventDefault();
        const name = document.getElementById('studentName').value;
        const cls = document.getElementById('studentClass').value;
        students.push({name, class: cls});
        setData('students', students);
        renderStudents();
    };
}
function deleteStudent(index) {
    const students = getData('students');
    students.splice(index, 1);
    setData('students', students);
    renderStudents();
}

// Classes Section
function renderClasses() {
    const classes = getData('classes');
    app.innerHTML = `
        <h2>Classes</h2>
        <form id="classForm">
            <input type="text" id="className" placeholder="Class Name" required />
            <button type="submit">Add Class</button>
        </form>
        <button onclick="renderMenu()">Back</button>
        <table>
            <tr><th>Class Name</th><th>Actions</th></tr>
            ${classes.map((c, i) => `<tr><td>${c.name}</td><td><button onclick="deleteClass(${i})">Delete</button></td></tr>`).join('')}
        </table>
    `;
    document.getElementById('classForm').onsubmit = function(e) {
        e.preventDefault();
        const name = document.getElementById('className').value;
        classes.push({name});
        setData('classes', classes);
        renderClasses();
    };
}
function deleteClass(index) {
    const classes = getData('classes');
    classes.splice(index, 1);
    setData('classes', classes);
    renderClasses();
}

// Initial render
renderMenu();