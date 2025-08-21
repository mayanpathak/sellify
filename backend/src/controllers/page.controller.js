import asyncHandler from 'express-async-handler';
import CheckoutPage from '../models/CheckoutPage.js';
import Submission from '../models/Submission.js';
import User from '../models/user.model.js';
import generateUniqueSlug from '../utils/slugify.js';

// @desc    Create a new checkout page
// @route   POST /api/pages
// @access  Private
export const createPage = asyncHandler(async (req, res) => {
    const { title, slug, ...rest } = req.body;
    const userId = req.user._id || req.user.id;

    let finalSlug = slug;
    if (!slug) {
        finalSlug = await generateUniqueSlug(title);
    } else {
        const existing = await CheckoutPage.findOne({ slug });
        if (existing) {
            res.status(400);
            throw new Error('URL slug is already taken.');
        }
    }

    const newPage = await CheckoutPage.create({ userId, title, slug: finalSlug, ...rest });
    await User.findByIdAndUpdate(userId, { $push: { createdPages: newPage._id } });

    res.status(201).json({ status: 'success', data: { page: newPage } });
});

// @desc    Get all pages created by the user with enhanced data
// @route   GET /api/pages
// @access  Private
export const getUserPages = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const { includeStats = false } = req.query;
    
    const pages = await CheckoutPage.find({ userId }).sort({ createdAt: -1 });
    
    if (includeStats === 'true') {
        // Get submission and payment stats for each page
        const pagesWithStats = await Promise.all(
            pages.map(async (page) => {
                const [totalSubmissions, completedSubmissions, pendingSubmissions] = await Promise.all([
                    Submission.countDocuments({ pageId: page._id }),
                    Submission.countDocuments({ pageId: page._id, paymentStatus: 'completed' }),
                    Submission.countDocuments({ pageId: page._id, paymentStatus: 'pending' })
                ]);

                const conversionRate = totalSubmissions > 0 
                    ? Math.round((completedSubmissions / totalSubmissions) * 100) 
                    : 0;

                return {
                    ...page.toObject(),
                    stats: {
                        totalSubmissions,
                        completedSubmissions,
                        pendingSubmissions,
                        freeSubmissions: totalSubmissions - completedSubmissions - pendingSubmissions,
                        conversionRate
                    }
                };
            })
        );
        
        return res.status(200).json({ 
            status: 'success', 
            results: pagesWithStats.length,
            data: { pages: pagesWithStats } 
        });
    }
    
    res.status(200).json({ status: 'success', results: pages.length, data: { pages } });
});

// @desc    Get a page by its slug
// @route   GET /api/pages/:slug
// @access  Public
export const getPageBySlug = asyncHandler(async (req, res) => {
    const page = await CheckoutPage.findOne({ slug: req.params.slug });
    if (!page) {
        res.status(404);
        throw new Error('Checkout page not found.');
    }

    // Get page owner's Stripe connection status
    const pageOwner = await User.findById(page.userId).select('stripeAccountId');
    const isStripeConnected = !!pageOwner?.stripeAccountId;

    res.status(200).json({ 
        status: 'success', 
        data: { 
            page,
            isStripeConnected 
        } 
    });
});

// @desc    Get a checkout page by ID (for internal use like mock checkout)
// @route   GET /api/pages/id/:id
// @access  Public
export const getPageById = asyncHandler(async (req, res) => {
    const page = await CheckoutPage.findById(req.params.id);
    if (!page) {
        res.status(404);
        throw new Error('Checkout page not found.');
    }

    // Get page owner's Stripe connection status
    const pageOwner = await User.findById(page.userId).select('stripeAccountId');
    const isStripeConnected = !!pageOwner?.stripeAccountId;

    res.status(200).json({ 
        status: 'success', 
        data: { 
            page,
            isStripeConnected 
        } 
    });
});

// @desc    Update a checkout page
// @route   PATCH /api/pages/:id
// @access  Private
export const updatePage = asyncHandler(async (req, res) => {
    const page = await CheckoutPage.findById(req.params.id);
    if (!page) {
        res.status(404);
        throw new Error('Page not found.');
    }

    const userId = req.user._id || req.user.id;
    if (page.userId.toString() !== userId.toString()) {
        res.status(403);
        throw new Error('You are not authorized to update this page.');
    }

    if (req.body.slug) {
        const existing = await CheckoutPage.findOne({ slug: req.body.slug });
        if (existing && existing._id.toString() !== req.params.id) {
            res.status(400);
            throw new Error('URL slug is already taken.');
        }
    }

    const updatedPage = await CheckoutPage.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ status: 'success', data: { page: updatedPage } });
});

// @desc    Delete a checkout page
// @route   DELETE /api/pages/:id
// @access  Private
export const deletePage = asyncHandler(async (req, res) => {
    const page = await CheckoutPage.findById(req.params.id);
    if (!page) {
        res.status(404);
        throw new Error('Page not found.');
    }

    const userId = req.user._id || req.user.id;
    if (page.userId.toString() !== userId.toString()) {
        res.status(403);
        throw new Error('You are not authorized to delete this page.');
    }

    await page.deleteOne();
    await User.findByIdAndUpdate(userId, { $pull: { createdPages: req.params.id } });

    res.status(204).json({ status: 'success', data: null });
});

// @desc    Get detailed page analytics
// @route   GET /api/pages/:id/analytics
// @access  Private
export const getPageAnalytics = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { days = 30 } = req.query;
    const userId = req.user._id || req.user.id;

    // Verify page ownership
    const page = await CheckoutPage.findById(id);
    if (!page) {
        res.status(404);
        throw new Error('Page not found.');
    }

    if (page.userId.toString() !== userId.toString()) {
        res.status(403);
        throw new Error('You are not authorized to view this page analytics.');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get detailed analytics
    const [
        totalSubmissions,
        recentSubmissions,
        submissionsByStatus,
        submissionsOverTime,
        topFormFields
    ] = await Promise.all([
        // Total submissions
        Submission.countDocuments({ pageId: id }),
        
        // Recent submissions count
        Submission.countDocuments({ 
            pageId: id, 
            createdAt: { $gte: startDate } 
        }),
        
        // Submissions by status
        Submission.aggregate([
            { $match: { pageId: page._id } },
            {
                $group: {
                    _id: '$paymentStatus',
                    count: { $sum: 1 }
                }
            }
        ]),
        
        // Submissions over time (daily)
        Submission.aggregate([
            {
                $match: {
                    pageId: page._id,
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
            { $sort: { _id: 1 } }
        ]),
        
        // Most common form field values
        Submission.aggregate([
            { $match: { pageId: page._id } },
            { $limit: 100 }, // Limit for performance
            {
                $project: {
                    formDataKeys: { $objectToArray: "$formData" }
                }
            },
            { $unwind: "$formDataKeys" },
            {
                $group: {
                    _id: "$formDataKeys.k",
                    count: { $sum: 1 },
                    sampleValues: { $addToSet: "$formDataKeys.v" }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ])
    ]);

    const statusMap = submissionsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
    }, {});

    const analytics = {
        pageInfo: {
            id: page._id,
            title: page.title,
            slug: page.slug,
            productName: page.productName,
            price: page.price,
            currency: page.currency,
            createdAt: page.createdAt
        },
        summary: {
            totalSubmissions,
            recentSubmissions,
            completedSubmissions: statusMap.completed || 0,
            pendingSubmissions: statusMap.pending || 0,
            freeSubmissions: statusMap.none || 0,
            conversionRate: totalSubmissions > 0 
                ? Math.round(((statusMap.completed || 0) / totalSubmissions) * 100) 
                : 0
        },
        submissionsOverTime,
        topFormFields: topFormFields.map(field => ({
            fieldName: field._id,
            submissionCount: field.count,
            sampleValues: field.sampleValues.slice(0, 3) // Show first 3 sample values
        }))
    };

    res.status(200).json({
        status: 'success',
        data: analytics
    });
});

// @desc    Duplicate a page
// @route   POST /api/pages/:id/duplicate
// @access  Private
export const duplicatePage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    // Get original page
    const originalPage = await CheckoutPage.findById(id);
    if (!originalPage) {
        res.status(404);
        throw new Error('Page not found.');
    }

    if (originalPage.userId.toString() !== userId.toString()) {
        res.status(403);
        throw new Error('You are not authorized to duplicate this page.');
    }

    // Create duplicate with unique slug
    const duplicateData = originalPage.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    
    duplicateData.title = `${duplicateData.title} (Copy)`;
    duplicateData.slug = await generateUniqueSlug(duplicateData.title);

    const duplicatedPage = await CheckoutPage.create(duplicateData);
    await User.findByIdAndUpdate(userId, { $push: { createdPages: duplicatedPage._id } });

    res.status(201).json({
        status: 'success',
        message: 'Page duplicated successfully.',
        data: { page: duplicatedPage }
    });
});

// @desc    Toggle page status (active/inactive)
// @route   PATCH /api/pages/:id/toggle-status
// @access  Private
export const togglePageStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const page = await CheckoutPage.findById(id);
    if (!page) {
        res.status(404);
        throw new Error('Page not found.');
    }

    if (page.userId.toString() !== userId.toString()) {
        res.status(403);
        throw new Error('You are not authorized to modify this page.');
    }

    // Toggle active status (assuming we add an 'active' field to the schema)
    const updatedPage = await CheckoutPage.findByIdAndUpdate(
        id, 
        { active: !page.active },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        status: 'success',
        message: `Page ${updatedPage.active ? 'activated' : 'deactivated'} successfully.`,
        data: { page: updatedPage }
    });
});


