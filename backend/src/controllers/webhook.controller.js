import asyncHandler from 'express-async-handler';
import stripe from '../config/stripe.js';
import User from '../models/user.model.js';
import CheckoutPage from '../models/CheckoutPage.js';
import Payment from '../models/Payment.js';
import Submission from '../models/Submission.js';

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
        console.log(`Processing checkout session completed: ${session.id}`);
        
        const { pageId, userId } = session.metadata || {};
        
        if (!pageId || !userId) {
            console.error('Missing pageId or userId in session metadata:', session.metadata);
            return;
        }

        // Check if we already processed this session (idempotency)
        const existingPayment = await Payment.findOne({ stripeSessionId: session.id });
        if (existingPayment && existingPayment.webhookProcessed) {
            console.log(`Payment already processed: ${session.id}`);
            return;
        }

        // Fetch related data
        const [page, user] = await Promise.all([
            CheckoutPage.findById(pageId),
            User.findById(userId)
        ]);

        if (!page) {
            console.error(`Page not found: ${pageId}`);
            return;
        }

        if (!user) {
            console.error(`User not found: ${userId}`);
            return;
        }

        // Create or update payment record
        let payment = existingPayment;
        if (!payment) {
            payment = new Payment({
                userId: userId,
                pageId: pageId,
                stripeSessionId: session.id,
                stripeAccountId: user.stripeAccountId,
                amount: session.amount_total,
                currency: session.currency,
                applicationFeeAmount: session.application_fee_amount,
                status: 'completed',
                customerEmail: session.customer_details?.email,
                customerName: session.customer_details?.name,
                metadata: new Map(Object.entries(session.metadata || {})),
                paymentCompletedAt: new Date(session.created * 1000),
                stripeCreatedAt: new Date(session.created * 1000),
                webhookProcessed: true,
                webhookProcessedAt: new Date()
            });
        } else {
            // Update existing payment
            payment.status = 'completed';
            payment.paymentCompletedAt = new Date(session.created * 1000);
            payment.customerEmail = session.customer_details?.email;
            payment.customerName = session.customer_details?.name;
            payment.webhookProcessed = true;
            payment.webhookProcessedAt = new Date();
        }

        await payment.save();

        // Try to link with existing submission if it exists
        try {
            const recentSubmission = await Submission.findOne({
                pageId: pageId,
                createdAt: { 
                    $gte: new Date(Date.now() - 30 * 60 * 1000) // Within last 30 minutes
                }
            }).sort({ createdAt: -1 });

            if (recentSubmission && !recentSubmission.paymentId) {
                recentSubmission.paymentId = payment._id;
                recentSubmission.paymentStatus = 'completed';
                await recentSubmission.save();
                
                payment.submissionId = recentSubmission._id;
                await payment.save();
                
                console.log(`Linked payment ${payment._id} with submission ${recentSubmission._id}`);
            }
        } catch (linkError) {
            console.error('Error linking payment to submission:', linkError);
            // Don't fail the webhook for linking errors
        }

        console.log(`✅ Payment completed successfully: ${payment._id}`);
        
        // TODO: Add notification system here
        // - Send confirmation emails
        // - Trigger real-time dashboard updates
        // - Send webhooks to user's systems
        
    } catch (error) {
        console.error('Error handling checkout session completed:', error);
        // Re-throw to ensure webhook returns error status for retry
        throw error;
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