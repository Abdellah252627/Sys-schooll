const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new sqlite3(path.join(dbDir, 'school.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Read and execute schema
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// Helper function to hash passwords
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Insert sample data
async function insertSampleData() {
  // Check if sample data already exists
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 1) {
    console.log('Sample data already exists. Skipping...');
    return;
  }

  console.log('Inserting sample data...');
  
  // Start a transaction
  const insert = db.transaction(() => {
    // Insert sample teachers
    const teacher1 = db.prepare(
      'INSERT INTO users (name, email, password, role, phone, isActive) VALUES (?, ?, ?, ?, ?, 1)'
    ).run('أحمد محمد', 'ahmed@school.com', bcrypt.hashSync('teacher123', 10), 'teacher', '0512345678');
    
    const teacher2 = db.prepare(
      'INSERT INTO users (name, email, password, role, phone, isActive) VALUES (?, ?, ?, ?, ?, 1)'
    ).run('سارة أحمد', 'sara@school.com', bcrypt.hashSync('teacher123', 10), 'teacher', '0512345679');

    // Insert sample students
    const students = [
      ['محمد علي', 'mohamed@school.com', 'student123', 'student', '0512345001', '1'],
      ['فاطمة حسن', 'fatima@school.com', 'student123', 'student', '0512345002', '1'],
      ['خالد عبدالله', 'khaled@school.com', 'student123', 'student', '0512345003', '1'],
      ['نورة سعيد', 'nora@school.com', 'student123', 'student', '0512345004', '1']
    ];

    const studentStmt = db.prepare(
      'INSERT INTO users (name, email, password, role, phone, studentId, isActive) VALUES (?, ?, ?, ?, ?, ?, 1)'
    );
    
    students.forEach(([name, email, password, role, phone, studentId]) => {
      studentStmt.run(name, email, bcrypt.hashSync(password, 10), role, phone, studentId);
    });

    // Insert sample classes
    const class1 = db.prepare(
      'INSERT INTO classes (name, grade, section, academicYear, description, teacherId) VALUES (?, ?, ?, ?, ?, ?)'
    ).run('أ', 'الأول الثانوي', 'أ', '2024-2025', 'الصف الأول الثانوي - قسم أ', teacher1.lastInsertRowid);

    const class2 = db.prepare(
      'INSERT INTO classes (name, grade, section, academicYear, description, teacherId) VALUES (?, ?, ?, ?, ?, ?)'
    ).run('ب', 'الأول الثانوي', 'ب', '2024-2025', 'الصف الأول الثانوي - قسم ب', teacher2.lastInsertRowid);

    // Enroll students in classes
    const enrollStmt = db.prepare('INSERT INTO user_classes (userId, classId) VALUES (?, ?)');
    
    // First two students in class 1
    enrollStmt.run(3, 1);
    enrollStmt.run(4, 1);
    
    // Last two students in class 2
    enrollStmt.run(5, 2);
    enrollStmt.run(6, 2);

    console.log('Sample data inserted successfully!');
  });

  // Execute the transaction
  insert();
}

// Run the initialization
insertSampleData();

// Close the database connection
process.on('exit', () => {
  db.close();
});

module.exports = db;
