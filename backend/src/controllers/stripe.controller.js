// import * as stripeService from '../services/stripe.service.js';

// export const connectAccount = async (req, res) => {
//     try {
//         const result = await stripeService.connectStripeAccount(req.user._id);
//         res.status(200).json({
//             status: 'success',
//             data: result,
//         });
//     } catch (error) {
//         res.status(500).json({ status: 'fail', message: error.message });
//     }
// };

// export const createSession = async (req, res) => {
//     try {
//         const { pageId } = req.params;
//         const result = await stripeService.createCheckoutSession(pageId, req.user._id);
//         res.status(200).json({
//             status: 'success',
//             data: result
//         });
//     } catch (error) {
//         res.status(400).json({ status: 'fail', message: error.message });
//     }
// };



import asyncHandler from 'express-async-handler';
import * as stripeService from '../services/stripe.service.js';

/**
 * @desc    Connect user's Stripe account
 * @route   POST /api/stripe/connect
 * @access  Private
 */
export const connectAccount = asyncHandler(async (req, res) => {
    const result = await stripeService.connectStripeAccount(req.user._id || req.user.id);
    res.status(200).json({
        status: 'success',
        data: result,
    });
});

/**
 * @desc    Create a Stripe Checkout Session
 * @route   POST /api/stripe/session/:pageId
 * @access  Private
 */
export const createSession = asyncHandler(async (req, res) => {
    const { pageId } = req.params;

    const result = await stripeService.createCheckoutSession({
        pageId,
        userId: req.user._id || req.user.id,
    });

    res.status(200).json({
        status: 'success',
        data: result,
    });
});
