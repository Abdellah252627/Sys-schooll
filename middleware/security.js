import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

// Set security HTTP headers
export const setSecurityHeaders = helmet();

// Limit requests from same IP
const limiter = rateLimit({
    max: 100, // 100 requests
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests from this IP, please try again in an hour!'
});

export const rateLimiter = limiter;

// Data sanitization against NoSQL query injection
export const sanitize = mongoSanitize();

// Data sanitization against XSS
export const xssProtection = xss();

// Prevent parameter pollution
export const preventParamPollution = hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
});

// Prevent CORS issues
export const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
};

// Secure cookies
const cookieOptions = {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};

export const secureCookies = (req, res, next) => {
    // Apply secure cookie settings
    req.cookieOptions = cookieOptions;
    next();
};
