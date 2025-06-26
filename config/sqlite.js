import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database
const db = new Database(path.join(__dirname, '../database.sqlite'), {
    verbose: console.log // Log SQL queries
});

// Enable foreign key constraints
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
const initDatabase = () => {
    // Users table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student', 'parent')),
            phone TEXT,
            avatar TEXT DEFAULT 'default.jpg',
            isActive BOOLEAN DEFAULT 1,
            resetPasswordToken TEXT,
            resetPasswordExpire TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Classes table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            teacherId INTEGER,
            academicYear TEXT NOT NULL,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (teacherId) REFERENCES users (id) ON DELETE SET NULL
        )
    `).run();

    // Assignments table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            dueDate TEXT NOT NULL,
            classId INTEGER NOT NULL,
            teacherId INTEGER NOT NULL,
            maxScore INTEGER,
            filePath TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (classId) REFERENCES classes (id) ON DELETE CASCADE,
            FOREIGN KEY (teacherId) REFERENCES users (id) ON DELETE CASCADE
        )
    `).run();

    // Submissions table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            assignmentId INTEGER NOT NULL,
            studentId INTEGER NOT NULL,
            filePath TEXT NOT NULL,
            submittedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            grade INTEGER,
            feedback TEXT,
            FOREIGN KEY (assignmentId) REFERENCES assignments (id) ON DELETE CASCADE,
            FOREIGN KEY (studentId) REFERENCES users (id) ON DELETE CASCADE,
            UNIQUE(assignmentId, studentId)
        )
    `).run();

    console.log('✅ Database tables created successfully'.green.bold);
};

// Initialize the database
initDatabase();

export default db;
