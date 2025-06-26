import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.cookies && req.cookies.token) {
        // Get token from cookie
        token = req.cookies.token;
    } else if (
        req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Get token from header
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const db = req.app.get('db');

        // Get user from the token
        const user = db.prepare('SELECT id, name, email, role, phone, avatar, isActive, createdAt FROM users WHERE id = ?').get(decoded.id);
        
        if (!user) {
            res.status(401);
            throw new Error('User not found');
        }

        // Check if user is active
        if (!user.isActive) {
            res.status(401);
            throw new Error('User account is deactivated');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        
        // Handle JWT specific errors
        if (error.name === 'JsonWebTokenError') {
            res.status(401);
            throw new Error('Invalid token');
        }
        
        if (error.name === 'TokenExpiredError') {
            res.status(401);
            throw new Error('Token has expired');
        }
        
        // For other errors
        res.status(401);
        throw new Error('Not authorized, authentication failed');
    }
});

// Grant access to specific roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401);
            throw new Error('User not authenticated');
        }
        
        if (!roles.includes(req.user.role)) {
            res.status(403);
            throw new Error(`User role ${req.user.role} is not authorized to access this route`);
        }
        
        next();
    };
};

// Check if user is the owner or admin
export const isOwnerOrAdmin = (req, res, next) => {
    try {
        const db = req.app.get('db');
        const resourceId = req.params.id || req.params.userId;
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // Admins can access any resource
        if (userRole === 'admin') {
            return next();
        }
        
        // For non-admin users, check if they own the resource
        if (resourceId !== userId) {
            res.status(403);
            throw new Error('Not authorized to access this resource');
        }
        
        next();
    } catch (error) {
        next(error);
    }
};

// Check if user is a teacher
export const isTeacher = (req, res, next) => {
    if (req.user.role !== 'teacher') {
        res.status(403);
        throw new Error('Teacher access required');
    }
    next();
};

// Check if user is a student
export const isStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        res.status(403);
        throw new Error('Student access required');
    }
    next();
};

// Check if user is a parent
export const isParent = (req, res, next) => {
    if (req.user.role !== 'parent') {
        res.status(403);
        throw new Error('Parent access required');
    }
    next();
};
