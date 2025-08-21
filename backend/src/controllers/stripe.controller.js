
import asyncHandler from 'express-async-handler';
import * as stripeService from '../services/stripe.service.js';
import User from '../models/user.model.js';
import stripe from '../config/stripe.js';

/**
 * @desc    Connect user's Stripe account
 * @route   POST /api/stripe/connect
 * @access  Private
 */
export const connectAccount = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    
    // Check if user already has a Stripe account connected
    const user = await User.findById(userId);
    if (user?.stripeAccountId) {
        // Check if account still exists and is valid
        try {
            if (process.env.NODE_ENV === 'production' && !user.stripeAccountId.startsWith('acct_mock_')) {
                const account = await stripe.accounts.retrieve(user.stripeAccountId);
                if (account.details_submitted) {
                    return res.status(200).json({
                        status: 'success',
                        message: 'Stripe account already connected and verified',
                        data: {
                            stripeAccountId: user.stripeAccountId,
                            alreadyConnected: true
                        }
                    });
                }
            } else {
                // Development mode - mock account
                return res.status(200).json({
                    status: 'success',
                    message: 'Stripe account already connected (development mode)',
                    data: {
                        stripeAccountId: user.stripeAccountId,
                        alreadyConnected: true
                    }
                });
            }
        } catch (error) {
            console.log('Existing Stripe account invalid, creating new one');
        }
    }
    
    const result = await stripeService.connectStripeAccount(userId);
    res.status(200).json({
        status: 'success',
        data: result,
    });
});

/**
 * @desc    Get Stripe account connection status
 * @route   GET /api/stripe/status
 * @access  Private
 */
export const getConnectionStatus = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select('stripeAccountId');
    
    if (!user?.stripeAccountId) {
        return res.status(200).json({
            status: 'success',
            data: {
                connected: false,
                accountId: null,
                details: null
            }
        });
    }

    // In development mode, return mock data
    if (process.env.NODE_ENV === 'development' || user.stripeAccountId.startsWith('acct_mock_')) {
        return res.status(200).json({
            status: 'success',
            data: {
                connected: true,
                accountId: user.stripeAccountId,
                details: {
                    charges_enabled: true,
                    payouts_enabled: true,
                    details_submitted: true,
                    mock: true
                }
            }
        });
    }

    try {
        const account = await stripe.accounts.retrieve(user.stripeAccountId);
        
        res.status(200).json({
            status: 'success',
            data: {
                connected: true,
                accountId: user.stripeAccountId,
                details: {
                    charges_enabled: account.charges_enabled,
                    payouts_enabled: account.payouts_enabled,
                    details_submitted: account.details_submitted,
                    requirements: account.requirements
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
});

/**
 * @desc    Disconnect Stripe account
 * @route   DELETE /api/stripe/disconnect
 * @access  Private
 */
export const disconnectAccount = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    
    await User.findByIdAndUpdate(userId, {
        $unset: { stripeAccountId: 1 }
    });
    
    res.status(200).json({
        status: 'success',
        message: 'Stripe account disconnected successfully'
    });
});

/**
 * @desc    Create a Stripe Checkout Session
 * @route   POST /api/stripe/session/:pageId
 * @access  Public (anyone can pay)
 */
export const createSession = asyncHandler(async (req, res) => {
    const { pageId } = req.params;

    // Get the page to find the owner (seller)
    const CheckoutPage = (await import('../models/CheckoutPage.js')).default;
    const page = await CheckoutPage.findById(pageId);
    
    if (!page) {
        res.status(404);
        throw new Error('Checkout page not found.');
    }

    const result = await stripeService.createCheckoutSession({
        pageId,
        userId: page.userId, // Use the page owner's userId (seller)
    });

    res.status(200).json({
        status: 'success',
        data: result,
    });
});

/**
 * @desc    Verify payment status (public endpoint for payment success page)
 * @route   GET /api/stripe/verify/:sessionId
 * @access  Public
 */
export const verifyPaymentStatus = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    
    if (!sessionId) {
        res.status(400);
        throw new Error('Session ID is required');
    }

    const Payment = (await import('../models/Payment.js')).default;
    const payment = await Payment.findOne({ stripeSessionId: sessionId })
        .populate('pageId', 'title productName slug')
        .lean();

    if (!payment) {
        res.status(404);
        throw new Error('Payment not found');
    }

    // Return limited payment details for public verification
    res.status(200).json({
        status: 'success',
        data: {
            payment: {
                _id: payment._id,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                customerEmail: payment.customerEmail,
                customerName: payment.customerName,
                paymentCompletedAt: payment.paymentCompletedAt || payment.createdAt,
                pageId: payment.pageId
            }
        }
    });
});