import asyncHandler from 'express-async-handler';
import Payment from '../models/Payment.js';
import CheckoutPage from '../models/CheckoutPage.js';
import Submission from '../models/Submission.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

/**
 * @desc    Get user's payment analytics
 * @route   GET /api/analytics/payments
 * @access  Private
 */
export const getUserPaymentAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;

    try {
        // Get overall payment stats
        const paymentStats = await Payment.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        // Get recent payments
        const recentPayments = await Payment.find({ userId })
            .populate('pageId', 'title productName')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // Get monthly revenue trend (last 12 months)
        const monthlyRevenue = await Payment.aggregate([
            { 
                $match: { 
                    userId: new mongoose.Types.ObjectId(userId),
                    status: 'completed',
                    paymentCompletedAt: {
                        $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$paymentCompletedAt' },
                        month: { $month: '$paymentCompletedAt' }
                    },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Format stats for easier consumption
        const formattedStats = {
            completed: { count: 0, totalAmount: 0 },
            pending: { count: 0, totalAmount: 0 },
            failed: { count: 0, totalAmount: 0 }
        };

        paymentStats.forEach(stat => {
            if (formattedStats[stat._id]) {
                formattedStats[stat._id] = {
                    count: stat.count,
                    totalAmount: stat.totalAmount
                };
            }
        });

        res.status(200).json({
            status: 'success',
            data: {
                stats: formattedStats,
                recentPayments,
                monthlyRevenue,
                totalRevenue: formattedStats.completed.totalAmount,
                totalTransactions: formattedStats.completed.count + formattedStats.pending.count + formattedStats.failed.count
            }
        });

    } catch (error) {
        console.error('Error fetching payment analytics:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch payment analytics'
        });
    }
});

/**
 * @desc    Get page-specific analytics
 * @route   GET /api/analytics/pages/:pageId
 * @access  Private
 */
export const getPageAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const { pageId } = req.params;

    try {
        // Verify page ownership
        const page = await CheckoutPage.findOne({ _id: pageId, userId });
        if (!page) {
            return res.status(404).json({
                status: 'fail',
                message: 'Page not found or access denied'
            });
        }

        // Get payment stats for this page
        const paymentStats = await Payment.aggregate([
            { $match: { pageId: new mongoose.Types.ObjectId(pageId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        // Get submission stats
        const submissionStats = await Submission.aggregate([
            { $match: { pageId: new mongoose.Types.ObjectId(pageId) } },
            {
                $group: {
                    _id: '$paymentStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get conversion rate (payments vs submissions)
        const totalSubmissions = await Submission.countDocuments({ pageId });
        const totalPayments = await Payment.countDocuments({ pageId, status: 'completed' });
        const conversionRate = totalSubmissions > 0 ? (totalPayments / totalSubmissions) * 100 : 0;

        // Get recent activity
        const recentPayments = await Payment.find({ pageId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const recentSubmissions = await Submission.find({ pageId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        res.status(200).json({
            status: 'success',
            data: {
                page: {
                    _id: page._id,
                    title: page.title,
                    productName: page.productName,
                    price: page.price,
                    slug: page.slug
                },
                paymentStats,
                submissionStats,
                conversionRate: Math.round(conversionRate * 100) / 100,
                totalSubmissions,
                totalPayments,
                recentPayments,
                recentSubmissions
            }
        });

    } catch (error) {
        console.error('Error fetching page analytics:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch page analytics'
        });
    }
});

/**
 * @desc    Get real-time payment status
 * @route   GET /api/analytics/payments/status
 * @access  Private
 */
export const getPaymentStatus = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const { sessionId, pageId } = req.query;

    try {
        let query = { userId };
        
        if (sessionId) {
            query.stripeSessionId = sessionId;
        }
        
        if (pageId) {
            query.pageId = pageId;
        }

        const payment = await Payment.findOne(query)
            .populate('pageId', 'title productName')
            .sort({ createdAt: -1 })
            .lean();

        if (!payment) {
            return res.status(404).json({
                status: 'fail',
                message: 'Payment not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: { payment }
        });

    } catch (error) {
        console.error('Error fetching payment status:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch payment status'
        });
    }
});

/**
 * @desc    Get Stripe account status
 * @route   GET /api/analytics/stripe-status
 * @access  Private
 */
export const getStripeAccountStatus = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;

    try {
        const user = await User.findById(userId).select('stripeAccountId');
        
        if (!user || !user.stripeAccountId) {
            return res.status(200).json({
                status: 'success',
                data: {
                    connected: false,
                    accountId: null,
                    details: null
                }
            });
        }

        // In development, return mock data
        if (process.env.NODE_ENV === 'development' && user.stripeAccountId.startsWith('acct_mock_')) {
            return res.status(200).json({
                status: 'success',
                data: {
                    connected: true,
                    accountId: user.stripeAccountId,
                    details: {
                        charges_enabled: true,
                        payouts_enabled: true,
                        details_submitted: true
                    }
                }
            });
        }

        // In production, fetch real Stripe account details
        try {
            const stripe = (await import('../config/stripe.js')).default;
            const account = await stripe.accounts.retrieve(user.stripeAccountId);
            
            res.status(200).json({
                status: 'success',
                data: {
                    connected: true,
                    accountId: user.stripeAccountId,
                    details: {
                        charges_enabled: account.charges_enabled,
                        payouts_enabled: account.payouts_enabled,
                        details_submitted: account.details_submitted
                    }
                }
            });
        } catch (stripeError) {
            console.error('Error fetching Stripe account:', stripeError);
            res.status(200).json({
                status: 'success',
                data: {
                    connected: false,
                    accountId: user.stripeAccountId,
                    details: null,
                    error: 'Account verification failed'
                }
            });
        }

    } catch (error) {
        console.error('Error checking Stripe account status:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to check Stripe account status'
        });
    }
});

/**
 * @desc    Get comprehensive dashboard analytics
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const { days = 30 } = req.query;

    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Get all user's pages
        const userPages = await CheckoutPage.find({ userId }).select('_id title slug productName price currency');
        const pageIds = userPages.map(page => page._id);

        // Get comprehensive analytics in parallel
        const [
            paymentStats,
            submissionStats,
            recentPayments,
            recentSubmissions,
            monthlyRevenue,
            topPerformingPages,
            conversionRates,
            revenueByPage
        ] = await Promise.all([
            // Payment statistics
            Payment.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' }
                    }
                }
            ]),

            // Submission statistics
            Submission.aggregate([
                { $match: { pageId: { $in: pageIds } } },
                {
                    $group: {
                        _id: '$paymentStatus',
                        count: { $sum: 1 }
                    }
                }
            ]),

            // Recent payments
            Payment.find({ userId })
                .populate('pageId', 'title productName')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean(),

            // Recent submissions
            Submission.find({ pageId: { $in: pageIds } })
                .populate('pageId', 'title productName')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean(),

            // Monthly revenue trend
            Payment.aggregate([
                { 
                    $match: { 
                        userId: new mongoose.Types.ObjectId(userId),
                        status: 'completed',
                        paymentCompletedAt: {
                            $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$paymentCompletedAt' },
                            month: { $month: '$paymentCompletedAt' }
                        },
                        revenue: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),

            // Top performing pages by revenue
            Payment.aggregate([
                { 
                    $match: { 
                        userId: new mongoose.Types.ObjectId(userId),
                        status: 'completed'
                    }
                },
                {
                    $group: {
                        _id: '$pageId',
                        revenue: { $sum: '$amount' },
                        transactionCount: { $sum: 1 }
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
                { $unwind: '$page' },
                {
                    $project: {
                        pageTitle: '$page.title',
                        pageSlug: '$page.slug',
                        revenue: 1,
                        transactionCount: 1
                    }
                },
                { $sort: { revenue: -1 } },
                { $limit: 10 }
            ]),

            // Conversion rates by page
            Submission.aggregate([
                { $match: { pageId: { $in: pageIds } } },
                {
                    $group: {
                        _id: '$pageId',
                        totalSubmissions: { $sum: 1 },
                        completedSubmissions: {
                            $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] }
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
                { $unwind: '$page' },
                {
                    $project: {
                        pageTitle: '$page.title',
                        pageSlug: '$page.slug',
                        totalSubmissions: 1,
                        completedSubmissions: 1,
                        conversionRate: {
                            $cond: [
                                { $gt: ['$totalSubmissions', 0] },
                                { $multiply: [{ $divide: ['$completedSubmissions', '$totalSubmissions'] }, 100] },
                                0
                            ]
                        }
                    }
                }
            ]),

            // Revenue by page for pie chart
            Payment.aggregate([
                { 
                    $match: { 
                        userId: new mongoose.Types.ObjectId(userId),
                        status: 'completed'
                    }
                },
                {
                    $group: {
                        _id: '$pageId',
                        revenue: { $sum: '$amount' }
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
                { $unwind: '$page' },
                {
                    $project: {
                        name: '$page.title',
                        value: '$revenue'
                    }
                }
            ])
        ]);

        // Format payment stats
        const formattedPaymentStats = {
            completed: { count: 0, totalAmount: 0 },
            pending: { count: 0, totalAmount: 0 },
            failed: { count: 0, totalAmount: 0 }
        };

        paymentStats.forEach(stat => {
            if (formattedPaymentStats[stat._id]) {
                formattedPaymentStats[stat._id] = {
                    count: stat.count,
                    totalAmount: stat.totalAmount
                };
            }
        });

        // Format submission stats
        const formattedSubmissionStats = {
            completed: 0,
            pending: 0,
            none: 0
        };

        submissionStats.forEach(stat => {
            if (formattedSubmissionStats[stat._id] !== undefined) {
                formattedSubmissionStats[stat._id] = stat.count;
            }
        });

        // Calculate totals and rates
        const totalRevenue = formattedPaymentStats.completed.totalAmount;
        const totalTransactions = formattedPaymentStats.completed.count + formattedPaymentStats.pending.count + formattedPaymentStats.failed.count;
        const totalSubmissions = formattedSubmissionStats.completed + formattedSubmissionStats.pending + formattedSubmissionStats.none;
        const overallConversionRate = totalSubmissions > 0 ? (formattedSubmissionStats.completed / totalSubmissions) * 100 : 0;
        const averageOrderValue = formattedPaymentStats.completed.count > 0 ? totalRevenue / formattedPaymentStats.completed.count : 0;

        res.status(200).json({
            status: 'success',
            data: {
                summary: {
                    totalRevenue,
                    totalTransactions,
                    totalSubmissions,
                    totalPages: userPages.length,
                    overallConversionRate: Math.round(overallConversionRate * 100) / 100,
                    averageOrderValue
                },
                paymentStats: formattedPaymentStats,
                submissionStats: formattedSubmissionStats,
                recentPayments,
                recentSubmissions,
                monthlyRevenue,
                topPerformingPages,
                conversionRates,
                revenueByPage,
                pages: userPages
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard analytics:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch dashboard analytics'
        });
    }
});

/**
 * @desc    Get revenue analytics with time series data
 * @route   GET /api/analytics/revenue
 * @access  Private
 */
export const getRevenueAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const { period = 'monthly', days = 365 } = req.query;

    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        let groupBy;
        let dateFormat;

        switch (period) {
            case 'daily':
                groupBy = {
                    year: { $year: '$paymentCompletedAt' },
                    month: { $month: '$paymentCompletedAt' },
                    day: { $dayOfMonth: '$paymentCompletedAt' }
                };
                dateFormat = "%Y-%m-%d";
                break;
            case 'weekly':
                groupBy = {
                    year: { $year: '$paymentCompletedAt' },
                    week: { $week: '$paymentCompletedAt' }
                };
                dateFormat = "%Y-W%V";
                break;
            case 'monthly':
            default:
                groupBy = {
                    year: { $year: '$paymentCompletedAt' },
                    month: { $month: '$paymentCompletedAt' }
                };
                dateFormat = "%Y-%m";
                break;
        }

        const revenueData = await Payment.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    status: 'completed',
                    paymentCompletedAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    revenue: { $sum: '$amount' },
                    transactionCount: { $sum: 1 },
                    averageOrderValue: { $avg: '$amount' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                revenueData,
                period,
                totalRevenue: revenueData.reduce((sum, item) => sum + item.revenue, 0),
                totalTransactions: revenueData.reduce((sum, item) => sum + item.transactionCount, 0)
            }
        });

    } catch (error) {
        console.error('Error fetching revenue analytics:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch revenue analytics'
        });
    }
});