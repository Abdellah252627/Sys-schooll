import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import fs from 'fs';
import colors from 'colors';
import errorHandler from './middleware/error.js';
import authRoutes from './routes/auth.js';
import gradeRoutes from './routes/grades.js';
import uploadRoutes from './routes/uploads.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set port
const PORT = process.env.PORT || 3000;

// Database connection is handled by SQLite
console.log('✅ Using SQLite database: database.sqlite'.green.bold);

// Make db accessible in routes
app.set('db', db);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/grades', gradeRoutes);
app.use('/api/v1', uploadRoutes);

// Create uploads directory if it doesn't exist
const uploadDirs = [
    path.join(__dirname, 'public/uploads'),
    path.join(__dirname, 'public/uploads/avatars'),
    path.join(__dirname, 'public/uploads/assignments'),
    path.join(__dirname, 'public/uploads/others')
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, 'client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// Error handling middleware
app.use(errorHandler);

// Start server
const server = app.listen(
    PORT,
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
    )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red.bold);
    // Close server & exit process
    server.close(() => process.exit(1));
});
