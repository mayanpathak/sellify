

import express from 'express';
import { 
    handleSubmission, 
    getUserSubmissions, 
    getSubmissionDetails,
    getSubmissionStats,
    exportSubmissions
} from '../controllers/submission.controller.js';
import { validateSubmission } from '../middleware/validation.middleware.js';
import { submissionLimiter } from '../middleware/rateLimiter.middleware.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router({ mergeParams: true });

/**
 * @route   POST /api/pages/:slug/submit
 * @access  Public
 * Note: This route is mounted under `/:slug/submit` in page.routes.js
 */
router.post('/', submissionLimiter, validateSubmission, handleSubmission);

// Create a separate router for general submission routes
export const submissionMainRouter = express.Router();

/**
 * @route   GET /api/submissions
 * @access  Private
 * @desc    Get all submissions for user's pages with filtering and pagination
 */
submissionMainRouter.get('/', protect, getUserSubmissions);

/**
 * @route   GET /api/submissions/stats
 * @access  Private
 * @desc    Get submission statistics for user
 */
submissionMainRouter.get('/stats', protect, getSubmissionStats);

/**
 * @route   GET /api/submissions/export
 * @access  Private
 * @desc    Export submissions as CSV
 */
submissionMainRouter.get('/export', protect, exportSubmissions);

/**
 * @route   GET /api/submissions/:id
 * @access  Private
 * @desc    Get submission details by ID
 */
submissionMainRouter.get('/:id', protect, getSubmissionDetails);

export default router;
