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
