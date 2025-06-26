import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Assignment from '../models/Assignment.js';
import User from '../models/User.js';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Upload file
// @route   POST /api/v1/upload
// @access  Private
export const uploadFile = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new ErrorResponse('الرجاء تحميل ملف', 400));
    }

    res.status(200).json({
        success: true,
        data: {
            fileName: req.file.filename,
            filePath: `/uploads/${req.file.filename}`,
            fileType: path.extname(req.file.originalname).substring(1),
            fileSize: req.file.size
        }
    });
});

// @desc    Upload avatar
// @route   PUT /api/v1/upload/avatar
// @access  Private
export const uploadAvatar = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new ErrorResponse('الرجاء تحميل صورة', 400));
    }

    // Check if file is an image
    const fileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!fileTypes.includes(req.file.mimetype)) {
        // Delete the uploaded file
        fs.unlinkSync(req.file.path);
        return next(new ErrorResponse('الرجاء تحميل صورة بصيغة JPEG أو JPG أو PNG', 400));
    }

    // Check file size (max 1MB)
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (req.file.size > maxSize) {
        fs.unlinkSync(req.file.path);
        return next(new ErrorResponse('حجم الصورة يجب ألا يتجاوز 1 ميجابايت', 400));
    }

    // Delete old avatar if exists
    const user = await User.findById(req.user.id);
    if (user.avatar && user.avatar !== 'default.jpg') {
        const oldAvatarPath = path.join(__dirname, `../public/uploads/avatars/${user.avatar}`);
        if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath);
        }
    }

    // Update user avatar
    user.avatar = req.file.filename;
    await user.save();

    res.status(200).json({
        success: true,
        data: {
            fileName: req.file.filename,
            filePath: `/uploads/avatars/${req.file.filename}`
        }
    });
});

// @desc    Upload assignment
// @route   POST /api/v1/assignments/:id/submit
// @access  Private/Student
export const submitAssignment = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new ErrorResponse('الرجاء تحميل ملف الواجب', 400));
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
        // Delete the uploaded file
        fs.unlinkSync(req.file.path);
        return next(new ErrorResponse('الواجب غير موجود', 404));
    }

    // Check if assignment is still open
    if (new Date() > assignment.dueDate) {
        fs.unlinkSync(req.file.path);
        return next(new ErrorResponse('انتهى موعد تسليم الواجب', 400));
    }

    // Check if student has already submitted
    const existingSubmission = assignment.submissions.find(
        sub => sub.student.toString() === req.user.id
    );

    if (existingSubmission) {
        // Delete the uploaded file
        fs.unlinkSync(req.file.path);
        return next(new ErrorResponse('لقد قمت بتسليم هذا الواجب مسبقاً', 400));
    }

    // Add submission
    assignment.submissions.push({
        student: req.user.id,
        file: req.file.filename,
        submittedAt: Date.now()
    });

    await assignment.save();

    res.status(200).json({
        success: true,
        data: {
            fileName: req.file.filename,
            filePath: `/uploads/assignments/${req.file.filename}`,
            submittedAt: new Date().toISOString()
        }
    });
});

// @desc    Download file
// @route   GET /api/v1/download/:filename
// @access  Private
export const downloadFile = asyncHandler(async (req, res, next) => {
    const file = path.join(__dirname, `../public/uploads/${req.params.filename}`);
    
    if (fs.existsSync(file)) {
        res.download(file);
    } else {
        return next(new ErrorResponse('الملف غير موجود', 404));
    }
});

export default {
    uploadFile,
    uploadAvatar,
    submitAssignment,
    downloadFile
};
