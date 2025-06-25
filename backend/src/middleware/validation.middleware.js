import { body, param, validationResult } from 'express-validator';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'fail',
            message: 'Validation error',
            errors: errors.array()
        });
    }
    next();
};

/**
 * Auth validation rules
 */
export const validateRegister = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
    handleValidationErrors
];

export const validateLogin = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    handleValidationErrors
];

/**
 * Page validation rules
 */
export const validateCreatePage = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Page title is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Page title must be between 3 and 100 characters'),
    
    body('productName')
        .trim()
        .notEmpty()
        .withMessage('Product name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Product name must be between 2 and 100 characters'),
    
    body('price')
        .isFloat({ min: 0.01 })
        .withMessage('Price must be a positive number greater than 0'),
    
    body('currency')
        .optional()
        .isIn(['usd', 'eur', 'gbp', 'cad', 'aud'])
        .withMessage('Currency must be one of: usd, eur, gbp, cad, aud'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    
    body('slug')
        .optional()
        .trim()
        .matches(/^[a-z0-9-]+$/)
        .withMessage('Slug can only contain lowercase letters, numbers, and hyphens')
        .isLength({ min: 3, max: 50 })
        .withMessage('Slug must be between 3 and 50 characters'),
    
    body('fields')
        .optional()
        .isArray()
        .withMessage('Fields must be an array'),
    
    body('fields.*.label')
        .if(body('fields').exists())
        .notEmpty()
        .withMessage('Field label is required'),
    
    body('fields.*.type')
        .if(body('fields').exists())
        .isIn(['text', 'email', 'number', 'textarea', 'checkbox'])
        .withMessage('Field type must be one of: text, email, number, textarea, checkbox'),
    
    body('successRedirectUrl')
        .optional()
        .custom((value) => {
            if (!value) return true; // Allow empty values
            try {
                new URL(value);
                return true;
            } catch (error) {
                throw new Error('Success redirect URL must be a valid URL');
            }
        }),
    
    body('cancelRedirectUrl')
        .optional()
        .custom((value) => {
            if (!value) return true; // Allow empty values
            try {
                new URL(value);
                return true;
            } catch (error) {
                throw new Error('Cancel redirect URL must be a valid URL');
            }
        }),
    
    body('layoutStyle')
        .optional()
        .isIn(['standard', 'modern', 'minimalist'])
        .withMessage('Layout style must be one of: standard, modern, minimalist'),
    
    handleValidationErrors
];

export const validateUpdatePage = [
    param('id')
        .isMongoId()
        .withMessage('Invalid page ID'),
    
    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Page title must be between 3 and 100 characters'),
    
    body('productName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Product name must be between 2 and 100 characters'),
    
    body('price')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('Price must be a positive number greater than 0'),
    
    body('currency')
        .optional()
        .isIn(['usd', 'eur', 'gbp', 'cad', 'aud'])
        .withMessage('Currency must be one of: usd, eur, gbp, cad, aud'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    
    body('slug')
        .optional()
        .trim()
        .matches(/^[a-z0-9-]+$/)
        .withMessage('Slug can only contain lowercase letters, numbers, and hyphens')
        .isLength({ min: 3, max: 50 })
        .withMessage('Slug must be between 3 and 50 characters'),
    
    handleValidationErrors
];

export const validatePageId = [
    param('id')
        .isMongoId()
        .withMessage('Invalid page ID'),
    
    handleValidationErrors
];

export const validateSlug = [
    param('slug')
        .trim()
        .matches(/^[a-z0-9-]+$/)
        .withMessage('Invalid slug format'),
    
    handleValidationErrors
];

/**
 * Submission validation
 */
export const validateSubmission = [
    param('slug')
        .trim()
        .matches(/^[a-z0-9-]+$/)
        .withMessage('Invalid slug format'),
    
    body()
        .custom((value, { req }) => {
            if (typeof value !== 'object' || Array.isArray(value)) {
                throw new Error('Request body must be an object');
            }
            return true;
        }),
    
    handleValidationErrors
]; 