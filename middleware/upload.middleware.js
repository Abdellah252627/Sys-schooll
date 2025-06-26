import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import ErrorResponse from '../utils/errorResponse.js'; // Updated path to utils directory

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = '';
        
        // Set upload path based on file type
        if (file.fieldname === 'avatar') {
            uploadPath = path.join(__dirname, '../public/uploads/avatars');
        } else if (file.fieldname === 'assignment') {
            uploadPath = path.join(__dirname, '../public/uploads/assignments');
        } else {
            uploadPath = path.join(__dirname, '../public/uploads/others');
        }
        
        // Create directory if it doesn't exist
        import('fs').then(fs => {
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
        }).catch(err => {
            console.error('Error creating upload directory:', err);
            cb(err, uploadPath);
        });
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

// Check file type
const checkFileType = (file, cb) => {
    // Allowed extensions
    const filetypes = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'text/plain': 'txt'
    };
    
    // Check mime type
    const mimetype = filetypes[file.mimetype];
    const extname = filetypes[file.mimetype];
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('File type not allowed'));
    }
};

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
});

// Middleware for handling single file upload
const uploadFile = (fieldName) => {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err) {
                return next(new ErrorResponse(`Error uploading file: ${err.message}`, 500));
            }
            next();
        });
    };
};

// Middleware for handling multiple file uploads
const uploadMultipleFiles = (fieldName, maxCount = 5) => {
    return (req, res, next) => {
        upload.array(fieldName, maxCount)(req, res, (err) => {
            if (err) {
                return next(new ErrorResponse(`Error uploading files: ${err.message}`, 500));
            }
            next();
        });
    };
};

// Middleware for handling specific field uploads
const uploadFields = (fields) => {
    return (req, res, next) => {
        upload.fields(fields)(req, res, (err) => {
            if (err) {
                return next(new ErrorResponse(`Error uploading files: ${err.message}`, 500));
            }
            next();
        });
    };
};

// Middleware for handling avatar upload
const uploadAvatar = (fieldName) => {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err) {
                return next(new ErrorResponse(`Error uploading file: ${err.message}`, 500));
            }
            next();
        });
    };
};

export {
    upload,
    uploadFile,
    uploadMultipleFiles,
    uploadFields,
    uploadAvatar
};
