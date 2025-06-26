import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Grade from './models/Grade.js';
import colors from 'colors';

// Load environment variables
dotenv.config();

// Connect to DB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
        return conn;
    } catch (error) {
        console.error(`Error: ${error.message}`.red.bold);
        process.exit(1);
    }
};

// Import data into DB
const importData = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Grade.deleteMany();

        // Create admin user
        const admin = await User.create({
            name: 'مدير النظام',
            email: 'admin@school.edu',
            password: 'admin123',
            role: 'admin',
            phone: '0500000000'
        });

        // Create teachers
        const teacher1 = await User.create({
            name: 'أحمد محمد',
            email: 'ahmed@school.edu',
            password: 'teacher123',
            role: 'teacher',
            phone: '0500000001',
            subjects: ['math', 'physics']
        });

        const teacher2 = await User.create({
            name: 'سارة أحمد',
            email: 'sara@school.edu',
            password: 'teacher123',
            role: 'teacher',
            phone: '0500000002',
            subjects: ['arabic', 'islamic']
        });

        // Create students
        const students = [];
        const studentData = [
            { name: 'خالد علي', email: 'student1@school.edu', class: '1A' },
            { name: 'نورة سعيد', email: 'student2@school.edu', class: '1A' },
            { name: 'عبدالله خالد', email: 'student3@school.edu', class: '1B' },
            { name: 'لطيفة محمد', email: 'student4@school.edu', class: '1B' },
            { name: 'محمد عبدالله', email: 'student5@school.edu', class: '2A' },
        ];

        for (const student of studentData) {
            const newStudent = await User.create({
                name: student.name,
                email: student.email,
                password: 'student123',
                role: 'student',
                phone: `0500${Math.floor(1000000 + Math.random() * 9000000)}`,
                class: student.class,
                parentName: `والد/ة ${student.name}`,
                parentPhone: `0500${Math.floor(1000000 + Math.random() * 9000000)}`
            });
            students.push(newStudent);
        }

        // Create sample grades
        const subjects = ['math', 'science', 'arabic', 'english', 'islamic'];
        const examTypes = ['quiz', 'homework', 'midterm', 'final'];
        
        for (const student of students) {
            for (const subject of subjects) {
                for (const examType of examTypes) {
                    await Grade.create({
                        student: student._id,
                        subject,
                        examType,
                        grade: Math.floor(Math.random() * 50) + 50, // Random grade between 50-100
                        maxGrade: 100,
                        weight: 25, // Each exam type has equal weight
                        notes: `ملاحظات على أداء ${student.name}`,
                        gradedBy: teacher1._id,
                        isPublished: true,
                        publishedAt: new Date()
                    });
                }
            }
        }


        console.log('Data Imported!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

// Destroy data
const destroyData = async () => {
    try {
        await User.deleteMany();
        await Grade.deleteMany();

        console.log('Data Destroyed!'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

// Run the appropriate command
if (process.argv[2] === '-d') {
    connectDB().then(destroyData);
} else {
    connectDB().then(importData);
}
