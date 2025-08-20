import asyncHandler from 'express-async-handler';
import Submission from '../models/Submission.js';
import CheckoutPage from '../models/CheckoutPage.js';

/**
 * @desc    Handle form submission for a public checkout page
 * @route   POST /api/pages/:slug/submit
 * @access  Public
 */
export const handleSubmission = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const page = await CheckoutPage.findOne({ slug });
    if (!page) {
        res.status(404);
        throw new Error('Checkout page not found.');
    }

    // Extract IP and User Agent for tracking
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    const submission = await Submission.create({
        pageId: page._id,
        formData: req.body,
        ipAddress,
        userAgent,
    });

    res.status(201).json({
        status: 'success',
        message: 'Form submitted successfully.',
        data: {
            submissionId: submission._id,
        },
    });
});

/**
 * @desc    Get submissions for a specific page (for page owner)
 * @route   GET /api/pages/:id/submissions
 * @access  Private (page owner only)
 */
export const getPageSubmissions = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    // Verify the page belongs to the user
    const page = await CheckoutPage.findById(id);
    if (!page) {
        res.status(404);
        throw new Error('Page not found.');
    }

    if (page.userId.toString() !== userId.toString()) {
        res.status(403);
        throw new Error('You are not authorized to view these submissions.');
    }

    const submissions = await Submission.find({ pageId: id })
        .sort({ createdAt: -1 })
        .select('formData createdAt');

    res.status(200).json({
        status: 'success',
        results: submissions.length,
        data: { submissions },
    });
});

/**
 * @desc    Get all submissions for user's pages
 * @route   GET /api/submissions
 * @access  Private
 */
export const getUserSubmissions = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;

    // Get all user's pages
    const userPages = await CheckoutPage.find({ userId }).select('_id title slug');
    const pageIds = userPages.map(page => page._id);

    // Get submissions for all user's pages
    const submissions = await Submission.find({ pageId: { $in: pageIds } })
        .populate('pageId', 'title slug')
        .sort({ createdAt: -1 })
        .select('formData createdAt pageId');

    res.status(200).json({
        status: 'success',
        results: submissions.length,
        data: { submissions },
    });
});
