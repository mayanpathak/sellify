import rateLimit from 'express-rate-limit';

// General rate limiter
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 auth requests per windowMs
    message: {
        status: 'error',
        message: 'Too many authentication attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
});

// Page creation limiter
export const createPageLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 page creations per hour
    message: {
        status: 'error',
        message: 'Too many pages created, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Submission rate limiter (more lenient for public submissions)
export const submissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 submissions per windowMs
    message: {
        status: 'error',
        message: 'Too many form submissions, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
}); 