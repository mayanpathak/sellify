// import express from 'express';
// const router = express.Router();

// // As mentioned, submission logic is in `page.routes.js` for this MVP.
// // This file is a placeholder.

// export default router;



import express from 'express';
import { handleSubmission, getUserSubmissions } from '../controllers/submission.controller.js';
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
 * @desc    Get all submissions for user's pages
 */
submissionMainRouter.get('/', protect, getUserSubmissions);

export default router;
