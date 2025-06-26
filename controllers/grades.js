import asyncHandler from 'express-async-handler';
import ErrorResponse from '../utils/errorResponse.js';
import Grade from '../models/Grade.js';
import User from '../models/User.js';
import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// @desc    Get all grades
// @route   GET /api/v1/grades
// @access  Private
export const getGrades = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Get single grade
// @route   GET /api/v1/grades/:id
// @access  Private
export const getGrade = asyncHandler(async (req, res, next) => {
    const grade = await Grade.findById(req.params.id)
        .populate({
            path: 'student',
            select: 'name email'
        })
        .populate({
            path: 'gradedBy',
            select: 'name'
        });

    if (!grade) {
        return next(
            new ErrorResponse(`Grade not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is grade owner or admin
    if (grade.student._id.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to access this grade`,
                401
            )
        );
    }

    res.status(200).json({
        success: true,
        data: grade
    });
});

// @desc    Create new grade
// @route   POST /api/v1/grades
// @access  Private
export const createGrade = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.gradedBy = req.user.id;

    // Check if grade already exists for this student, subject and exam type
    const existingGrade = await Grade.findOne({
        student: req.body.student,
        subject: req.body.subject,
        examType: req.body.examType,
        isPublished: true
    });

    if (existingGrade) {
        return next(
            new ErrorResponse(
                `Grade already exists for this student, subject and exam type`,
                400
            )
        );
    }

    const grade = await Grade.create(req.body);

    res.status(201).json({
        success: true,
        data: grade
    });
});

// @desc    Update grade
// @route   PUT /api/v1/grades/:id
// @access  Private
export const updateGrade = asyncHandler(async (req, res, next) => {
    let grade = await Grade.findById(req.params.id);

    if (!grade) {
        return next(
            new ErrorResponse(`Grade not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is grade owner or admin
    if (grade.gradedBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this grade`,
                401
            )
        );
    }

    // If grade is being published, set publishedAt
    if (req.body.isPublished && !grade.isPublished) {
        req.body.publishedAt = Date.now();
    }

    grade = await Grade.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: grade
    });
});

// @desc    Delete grade
// @route   DELETE /api/v1/grades/:id
// @access  Private
export const deleteGrade = asyncHandler(async (req, res, next) => {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
        return next(
            new ErrorResponse(`Grade not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is grade owner or admin
    if (grade.gradedBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to delete this grade`,
                401
            )
        );
    }

    await grade.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get grades for a specific student
// @route   GET /api/v1/students/:studentId/grades
// @access  Private
export const getStudentGrades = asyncHandler(async (req, res, next) => {
    if (req.params.studentId !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to access these grades`,
                401
            )
        );
    }

    const grades = await Grade.find({ student: req.params.studentId })
        .populate({
            path: 'gradedBy',
            select: 'name'
        })
        .sort({ subject: 1, examType: 1 });

    res.status(200).json({
        success: true,
        count: grades.length,
        data: grades
    });
});

// @desc    Get grades for a specific class and subject
// @route   GET /api/v1/classes/:classId/subjects/:subject/grades
// @access  Private/Admin
export const getClassSubjectGrades = asyncHandler(async (req, res, next) => {
    const students = await User.find({ 
        class: req.params.classId,
        role: 'student'
    }).select('_id name');

    const studentIds = students.map(student => student._id);

    const grades = await Grade.find({
        student: { $in: studentIds },
        subject: req.params.subject,
        isPublished: true
    })
    .populate({
        path: 'student',
        select: 'name'
    })
    .sort({ examType: 1 });

    // Organize grades by student
    const gradesByStudent = students.map(student => {
        const studentGrades = grades.filter(
            grade => grade.student._id.toString() === student._id.toString()
        );
        return {
            student: student.name,
            grades: studentGrades
        };
    });

    res.status(200).json({
        success: true,
        count: gradesByStudent.length,
        data: gradesByStudent
    });
});

// @desc    Export grades to Excel
// @route   GET /api/v1/grades/export/excel
// @access  Private/Admin
export const exportGradesToExcel = asyncHandler(async (req, res, next) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Grades');

    // Add headers
    worksheet.columns = [
        { header: 'Student', key: 'student', width: 30 },
        { header: 'Subject', key: 'subject', width: 20 },
        { header: 'Exam Type', key: 'examType', width: 20 },
        { header: 'Grade', key: 'grade', width: 10 },
        { header: 'Max Grade', key: 'maxGrade', width: 10 },
        { header: 'Percentage', key: 'percentage', width: 15 },
        { header: 'Graded By', key: 'gradedBy', width: 25 },
        { header: 'Date', key: 'date', width: 20 }
    ];

    // Get grades based on query parameters
    let query = {};
    
    if (req.query.student) {
        query.student = req.query.student;
    }
    
    if (req.query.subject) {
        query.subject = req.query.subject;
    }
    
    if (req.query.examType) {
        query.examType = req.query.examType;
    }
    
    if (req.query.fromDate && req.query.toDate) {
        query.date = {
            $gte: new Date(req.query.fromDate),
            $lte: new Date(req.query.toDate)
        };
    }

    const grades = await Grade.find(query)
        .populate('student', 'name')
        .populate('gradedBy', 'name');

    // Add rows
    grades.forEach(grade => {
        const percentage = (grade.grade / grade.maxGrade) * 100;
        worksheet.addRow({
            student: grade.student.name,
            subject: grade.subject,
            examType: grade.examType,
            grade: grade.grade,
            maxGrade: grade.maxGrade,
            percentage: `${percentage.toFixed(2)}%`,
            gradedBy: grade.gradedBy.name,
            date: grade.date.toLocaleDateString()
        });
    });

    // Style headers
    worksheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
    });

    // Set response headers
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=grades-export.xlsx'
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
});

// @desc    Export grades to PDF
// @route   GET /api/v1/grades/export/pdf
// @access  Private/Admin
export const exportGradesToPDF = asyncHandler(async (req, res, next) => {
    // Get grades based on query parameters
    let query = {};
    
    if (req.query.student) {
        query.student = req.query.student;
    }
    
    if (req.query.subject) {
        query.subject = req.query.subject;
    }
    
    if (req.query.examType) {
        query.examType = req.query.examType;
    }
    
    if (req.query.fromDate && req.query.toDate) {
        query.date = {
            $gte: new Date(req.query.fromDate),
            $lte: new Date(req.query.toDate)
        };
    }

    const grades = await Grade.find(query)
        .populate('student', 'name')
        .populate('gradedBy', 'name')
        .sort({ 'student.name': 1, subject: 1, examType: 1 });

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=grades-export.pdf');
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add title
    doc.fontSize(20).text('Grades Report', { align: 'center' });
    doc.moveDown();
    
    // Add date
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown(2);
    
    // Initialize variables for table
    const table = {
        headers: ['Student', 'Subject', 'Exam Type', 'Grade', 'Percentage', 'Date'],
        rows: []
    };
    
    // Add grades to table
    grades.forEach(grade => {
        const percentage = (grade.grade / grade.maxGrade) * 100;
        table.rows.push([
            grade.student.name,
            grade.subject,
            grade.examType,
            `${grade.grade}/${grade.maxGrade}`,
            `${percentage.toFixed(2)}%`,
            grade.date.toLocaleDateString()
        ]);
    });
    
    // Set table properties
    const tableTop = 150;
    const leftMargin = 50;
    const rowHeight = 30;
    const colWidth = (doc.page.width - 100) / table.headers.length;
    
    // Draw table headers
    doc.font('Helvetica-Bold');
    table.headers.forEach((header, i) => {
        doc.text(header, leftMargin + (i * colWidth), tableTop, {
            width: colWidth,
            align: 'left'
        });
    });
    
    // Draw horizontal line
    doc.moveTo(leftMargin, tableTop + 20)
       .lineTo(doc.page.width - leftMargin, tableTop + 20)
       .stroke();
    
    // Draw table rows
    doc.font('Helvetica');
    table.rows.forEach((row, i) => {
        const y = tableTop + (i + 1) * rowHeight;
        
        // Add alternating row background
        if (i % 2 === 0) {
            doc.rect(leftMargin, y - 10, doc.page.width - 100, rowHeight)
               .fill('#f5f5f5');
        }
        
        // Add row data
        row.forEach((cell, j) => {
            doc.text(cell, leftMargin + (j * colWidth), y, {
                width: colWidth,
                align: 'left'
            });
        });
    });
    
    // Finalize PDF
    doc.end();
});

export default {
    getGrades,
    getGrade,
    createGrade,
    updateGrade,
    deleteGrade,
    getStudentGrades,
    getClassSubjectGrades,
    exportGradesToExcel,
    exportGradesToPDF
};
