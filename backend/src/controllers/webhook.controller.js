import asyncHandler from 'express-async-handler';
import stripe from '../config/stripe.js';
import User from '../models/user.model.js';
import CheckoutPage from '../models/CheckoutPage.js';

/**
 * @desc    Handle Stripe webhook events
 * @route   POST /api/webhooks/stripe
 * @access  Public (but verified with Stripe signature)
 */
export const handleStripeWebhook = asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
        console.error('Stripe webhook secret not configured');
        return res.status(400).send('Webhook secret not configured');
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            await handleCheckoutSessionCompleted(event.data.object);
            break;
        
        case 'payment_intent.succeeded':
            await handlePaymentSucceeded(event.data.object);
            break;
        
        case 'account.updated':
            await handleAccountUpdated(event.data.object);
            break;
        
        case 'payment_intent.payment_failed':
            await handlePaymentFailed(event.data.object);
            break;
        
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

/**
 * Handle successful checkout session completion
 */
const handleCheckoutSessionCompleted = async (session) => {
    try {
        const { pageId, userId } = session.metadata;
        
        if (pageId && userId) {
            // Log successful payment
            console.log(`Payment completed for page ${pageId} by user ${userId}`);
            
            // Here you could:
            // - Send confirmation emails
            // - Update analytics
            // - Trigger fulfillment processes
            // - Update user permissions
        }
    } catch (error) {
        console.error('Error handling checkout session completed:', error);
    }
};

/**
 * Handle successful payment
 */
const handlePaymentSucceeded = async (paymentIntent) => {
    try {
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        
        // You can add additional logic here for successful payments
        // such as updating order status, sending receipts, etc.
    } catch (error) {
        console.error('Error handling payment succeeded:', error);
    }
};

/**
 * Handle Stripe account updates
 */
const handleAccountUpdated = async (account) => {
    try {
        // Update user's Stripe account status
        const user = await User.findOne({ stripeAccountId: account.id });
        
        if (user) {
            // You could update user's account status based on account.charges_enabled, etc.
            console.log(`Account updated for user ${user._id}: ${account.id}`);
        }
    } catch (error) {
        console.error('Error handling account updated:', error);
    }
};

/**
 * Handle failed payments
 */
const handlePaymentFailed = async (paymentIntent) => {
    try {
        console.log(`Payment failed: ${paymentIntent.id}`);
        
        // You can add logic here to handle failed payments
        // such as notifying the customer, retrying payment, etc.
    } catch (error) {
        console.error('Error handling payment failed:', error);
    }
}; 