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

    // For pages with payment enabled, create a pending submission
    // It will only be counted after successful payment via webhook
    const paymentStatus = page.price > 0 ? 'pending' : 'none';

    const submission = await Submission.create({
        pageId: page._id,
        formData: req.body,
        ipAddress,
        userAgent,
        paymentStatus,
    });

    res.status(201).json({
        status: 'success',
        message: 'Form submitted successfully.',
        data: {
            submissionId: submission._id,
            requiresPayment: page.price > 0,
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

    const submissions = await Submission.find({ 
        pageId: id,
        paymentStatus: { $in: ['completed', 'none'] }
    })
        .sort({ createdAt: -1 })
        .select('formData createdAt paymentStatus');

    res.status(200).json({
        status: 'success',
        results: submissions.length,
        data: { submissions },
    });
});

/**
 * @desc    Get all submissions for user's pages with filtering and pagination
 * @route   GET /api/submissions
 * @access  Private
 */
export const getUserSubmissions = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const { 
        page = 1, 
        limit = 20, 
        pageId, 
        paymentStatus, 
        search,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;

    // Get all user's pages
    const userPages = await CheckoutPage.find({ userId }).select('_id title slug productName');
    const pageIds = userPages.map(page => page._id);

    // Build query
    const query = { 
        pageId: { $in: pageIds },
        paymentStatus: { $in: ['completed', 'none'] }
    };

    // Add filters
    if (pageId) {
        query.pageId = pageId;
    }

    if (paymentStatus && paymentStatus !== 'all') {
        query.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search in form data
    if (search) {
        query.$or = [
            { 'formData.Email': { $regex: search, $options: 'i' } },
            { 'formData.Name': { $regex: search, $options: 'i' } },
            { 'formData.Full Name': { $regex: search, $options: 'i' } },
            { 'formData.Email Address': { $regex: search, $options: 'i' } },
        ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get submissions with pagination
    const [submissions, totalCount] = await Promise.all([
        Submission.find(query)
            .populate('pageId', 'title slug productName price currency')
            .populate('paymentId', 'amount currency status customerEmail customerName')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .select('formData createdAt pageId paymentStatus paymentId ipAddress userAgent'),
        Submission.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.status(200).json({
        status: 'success',
        results: submissions.length,
        pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalCount,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
        },
        data: { 
            submissions,
            pages: userPages // Include page info for filters
        },
    });
});

/**
 * @desc    Get submission details by ID
 * @route   GET /api/submissions/:id
 * @access  Private
 */
export const getSubmissionDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const submission = await Submission.findById(id)
        .populate('pageId', 'title slug productName price currency fields')
        .populate('paymentId', 'amount currency status customerEmail customerName paymentCompletedAt stripeSessionId');

    if (!submission) {
        res.status(404);
        throw new Error('Submission not found.');
    }

    // Verify the submission belongs to user's page
    const page = await CheckoutPage.findById(submission.pageId._id);
    if (!page || page.userId.toString() !== userId.toString()) {
        res.status(403);
        throw new Error('You are not authorized to view this submission.');
    }

    res.status(200).json({
        status: 'success',
        data: { submission },
    });
});

/**
 * @desc    Get submission statistics for user
 * @route   GET /api/submissions/stats
 * @access  Private
 */
export const getSubmissionStats = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const { days = 30 } = req.query;

    // Get all user's pages
    const userPages = await CheckoutPage.find({ userId }).select('_id title');
    const pageIds = userPages.map(page => page._id);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get submission statistics
    const stats = await Submission.aggregate([
        {
            $match: {
                pageId: { $in: pageIds },
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: null,
                totalSubmissions: { $sum: 1 },
                completedSubmissions: {
                    $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] }
                },
                pendingSubmissions: {
                    $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
                },
                freeSubmissions: {
                    $sum: { $cond: [{ $eq: ['$paymentStatus', 'none'] }, 1, 0] }
                }
            }
        }
    ]);

    // Get submissions by page
    const submissionsByPage = await Submission.aggregate([
        {
            $match: {
                pageId: { $in: pageIds },
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$pageId',
                count: { $sum: 1 },
                completed: {
                    $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] }
                },
                pending: {
                    $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
                }
            }
        },
        {
            $lookup: {
                from: 'checkoutpages',
                localField: '_id',
                foreignField: '_id',
                as: 'page'
            }
        },
        {
            $unwind: '$page'
        },
        {
            $project: {
                pageTitle: '$page.title',
                pageSlug: '$page.slug',
                count: 1,
                completed: 1,
                pending: 1
            }
        }
    ]);

    // Get submissions over time (daily for last 30 days)
    const submissionsOverTime = await Submission.aggregate([
        {
            $match: {
                pageId: { $in: pageIds },
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt"
                    }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    const result = stats[0] || {
        totalSubmissions: 0,
        completedSubmissions: 0,
        pendingSubmissions: 0,
        freeSubmissions: 0
    };

    result.conversionRate = result.totalSubmissions > 0 
        ? Math.round((result.completedSubmissions / result.totalSubmissions) * 100) 
        : 0;
    result.submissionsByPage = submissionsByPage;
    result.submissionsOverTime = submissionsOverTime;

    res.status(200).json({
        status: 'success',
        data: result
    });
});

/**
 * @desc    Export submissions as CSV
 * @route   GET /api/submissions/export
 * @access  Private
 */
export const exportSubmissions = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const { pageId, startDate, endDate, format = 'csv' } = req.query;

    // Get all user's pages
    const userPages = await CheckoutPage.find({ userId }).select('_id title slug');
    const pageIds = userPages.map(page => page._id);

    // Build query
    const query = { 
        pageId: { $in: pageIds },
        paymentStatus: { $in: ['completed', 'none'] }
    };

    if (pageId) {
        query.pageId = pageId;
    }

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const submissions = await Submission.find(query)
        .populate('pageId', 'title slug productName')
        .populate('paymentId', 'amount currency customerEmail customerName')
        .sort({ createdAt: -1 });

    if (format === 'csv') {
        // Generate CSV
        const csvHeader = 'Date,Page,Customer Name,Customer Email,Payment Status,Form Data\n';
        const csvRows = submissions.map(submission => {
            const date = new Date(submission.createdAt).toLocaleDateString();
            const page = submission.pageId?.title || 'Unknown';
            const customerName = submission.paymentId?.customerName || 
                                submission.formData['Full Name'] || 
                                submission.formData['Name'] || 'N/A';
            const customerEmail = submission.paymentId?.customerEmail || 
                                 submission.formData['Email Address'] || 
                                 submission.formData['Email'] || 'N/A';
            const paymentStatus = submission.paymentStatus;
            const formDataStr = Object.entries(submission.formData)
                .map(([key, value]) => `${key}: ${value}`)
                .join('; ');

            return `"${date}","${page}","${customerName}","${customerEmail}","${paymentStatus}","${formDataStr}"`;
        }).join('\n');

        const csv = csvHeader + csvRows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="submissions.csv"');
        res.send(csv);
    } else {
        res.status(200).json({
            status: 'success',
            results: submissions.length,
            data: { submissions }
        });
    }
});
