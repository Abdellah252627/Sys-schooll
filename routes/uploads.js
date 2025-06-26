import express from 'express';
import * as uploadController from '../controllers/uploadController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadFile, uploadAvatar, uploadMultipleFiles } from '../middleware/upload.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Upload file
// @route   POST /api/v1/upload
router.post('/', uploadFile('file'), uploadController.uploadFile);

// @desc    Upload avatar
// @route   PUT /api/v1/upload/avatar
router.put('/avatar', uploadAvatar('avatar'), uploadController.uploadAvatar);

// @desc    Submit assignment
// @route   POST /api/v1/assignments/:id/submit
// @access  Private/Student
router.post(
    '/assignments/:id/submit',
    authorize('student'),
    uploadFile('assignment'),
    uploadController.submitAssignment
);

// @desc    Download file
// @route   GET /api/v1/download/:filename
router.get('/download/:filename', uploadController.downloadFile);

export default router;
