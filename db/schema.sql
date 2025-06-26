-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student', 'parent')),
  phone TEXT,
  avatar TEXT,
  isActive BOOLEAN DEFAULT 1,
  resetPasswordToken TEXT,
  resetPasswordExpire DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  section TEXT,
  academicYear TEXT NOT NULL,
  description TEXT,
  teacherId INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacherId) REFERENCES users (id)
);

-- User-Classes (enrollment) table
CREATE TABLE IF NOT EXISTS user_classes (
  userId INTEGER,
  classId INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (userId, classId),
  FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (classId) REFERENCES classes (id) ON DELETE CASCADE
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  classId INTEGER NOT NULL,
  teacherId INTEGER NOT NULL,
  dueDate DATETIME NOT NULL,
  totalMarks INTEGER,
  attachment TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (classId) REFERENCES classes (id) ON DELETE CASCADE,
  FOREIGN KEY (teacherId) REFERENCES users (id)
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignmentId INTEGER NOT NULL,
  studentId INTEGER NOT NULL,
  filePath TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'submitted', 'graded')),
  submittedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(assignmentId, studentId),
  FOREIGN KEY (assignmentId) REFERENCES assignments (id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES users (id)
);

-- Grades table
CREATE TABLE IF NOT EXISTS grades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId INTEGER NOT NULL,
  classId INTEGER NOT NULL,
  assignmentId INTEGER,
  grade REAL NOT NULL CHECK(grade >= 0 AND grade <= 100),
  notes TEXT,
  gradedBy INTEGER NOT NULL,
  gradedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(studentId, assignmentId),
  FOREIGN KEY (studentId) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (classId) REFERENCES classes (id) ON DELETE CASCADE,
  FOREIGN KEY (assignmentId) REFERENCES assignments (id) ON DELETE SET NULL,
  FOREIGN KEY (gradedBy) REFERENCES users (id)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId INTEGER NOT NULL,
  classId INTEGER NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'late', 'excused')),
  notes TEXT,
  recordedBy INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(studentId, classId, date),
  FOREIGN KEY (studentId) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (classId) REFERENCES classes (id) ON DELETE CASCADE,
  FOREIGN KEY (recordedBy) REFERENCES users (id)
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Class-Subjects relationship
CREATE TABLE IF NOT EXISTS class_subjects (
  classId INTEGER,
  subjectId INTEGER,
  teacherId INTEGER,
  academicYear TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (classId, subjectId, academicYear),
  FOREIGN KEY (classId) REFERENCES classes (id) ON DELETE CASCADE,
  FOREIGN KEY (subjectId) REFERENCES subjects (id) ON DELETE CASCADE,
  FOREIGN KEY (teacherId) REFERENCES users (id)
);

-- Timetable table
CREATE TABLE IF NOT EXISTS timetable (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  classId INTEGER NOT NULL,
  subjectId INTEGER NOT NULL,
  teacherId INTEGER NOT NULL,
  dayOfWeek INTEGER NOT NULL CHECK(dayOfWeek BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  academicYear TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (classId) REFERENCES classes (id) ON DELETE CASCADE,
  FOREIGN KEY (subjectId) REFERENCES subjects (id) ON DELETE CASCADE,
  FOREIGN KEY (teacherId) REFERENCES users (id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  referenceId INTEGER,
  isRead BOOLEAN DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO users (name, email, password, role, isActive) 
VALUES ('مدير النظام', 'admin@school.com', '$2a$10$XFDq3wKm2HMjrJz5nBm3Ue1U1pVxVxkB7XQvLdLJz9rJ1YJX8X6Xm', 'admin', 1);

-- Insert some sample subjects
INSERT OR IGNORE INTO subjects (name, code, description) VALUES
('اللغة العربية', 'ARB101', 'اللغة العربية والقراءة'),
('اللغة الإنجليزية', 'ENG101', 'اللغة الإنجليزية'),
('الرياضيات', 'MATH101', 'الرياضيات الأساسية'),
('العلوم', 'SCI101', 'العلوم العامة'),
('الدراسات الاجتماعية', 'SOC101', 'التاريخ والجغرافيا'),
('التربية الإسلامية', 'ISL101', 'القرآن الكريم والحديث'),
('الحاسب الآلي', 'COM101', 'مقدمة في الحاسب الآلي'),
('التربية الفنية', 'ART101', 'الرسم والفنون'),
('التربية البدنية', 'PE101', 'التربية الرياضية'),
('الفيزياء', 'PHY101', 'الفيزياء العامة'),
('الكيمياء', 'CHEM101', 'الكيمياء العامة'),
('الأحياء', 'BIO101', 'علم الأحياء');
