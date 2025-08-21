import asyncHandler from 'express-async-handler';
import stripe from '../config/stripe.js';
import User from '../models/user.model.js';
import CheckoutPage from '../models/CheckoutPage.js';
import Payment from '../models/Payment.js';
import Submission from '../models/Submission.js';
import WebhookEvent from '../models/WebhookEvent.js';

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
    let webhookEventRecord;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Create webhook event record
    try {
        webhookEventRecord = new WebhookEvent({
            stripeEventId: event.id,
            eventType: event.type,
            status: 'processing',
            eventData: event.data.object,
            requestHeaders: req.headers,
            signature: sig,
            rawBody: req.body.toString()
        });
        await webhookEventRecord.save();
    } catch (logError) {
        console.error('Failed to log webhook event:', logError);
        // Continue processing even if logging fails
    }

    // Handle the event
    try {
        let processingResult = null;
        let userId = null;
        let pageId = null;
        let paymentId = null;

        switch (event.type) {
            case 'checkout.session.completed':
                processingResult = await handleCheckoutSessionCompleted(event.data.object);
                userId = event.data.object.metadata?.userId;
                pageId = event.data.object.metadata?.pageId;
                break;
            
            case 'payment_intent.succeeded':
                processingResult = await handlePaymentSucceeded(event.data.object);
                break;
            
            case 'account.updated':
                processingResult = await handleAccountUpdated(event.data.object);
                // Find user by stripe account ID
                const user = await User.findOne({ stripeAccountId: event.data.object.id });
                userId = user?._id;
                break;
            
            case 'payment_intent.payment_failed':
                processingResult = await handlePaymentFailed(event.data.object);
                break;
            
            default:
                console.log(`Unhandled event type ${event.type}`);
                processingResult = { message: `Unhandled event type: ${event.type}` };
        }

        // Update webhook event record with success
        if (webhookEventRecord) {
            webhookEventRecord.status = 'completed';
            webhookEventRecord.processedAt = new Date();
            webhookEventRecord.processingResult = processingResult;
            webhookEventRecord.userId = userId;
            webhookEventRecord.pageId = pageId;
            webhookEventRecord.paymentId = paymentId;
            await webhookEventRecord.save();
        }

    } catch (processingError) {
        console.error('Webhook processing error:', processingError);
        
        // Update webhook event record with error
        if (webhookEventRecord) {
            webhookEventRecord.status = 'failed';
            webhookEventRecord.processedAt = new Date();
            webhookEventRecord.processingError = processingError.message;
            await webhookEventRecord.save();
        }

        // Return error to trigger Stripe retry
        return res.status(500).send('Webhook processing failed');
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
        
        return {
            success: true,
            paymentId: payment._id,
            message: 'Checkout session completed successfully'
        };
        
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
        
        return {
            success: true,
            paymentIntentId: paymentIntent.id,
            message: 'Payment succeeded'
        };
    } catch (error) {
        console.error('Error handling payment succeeded:', error);
        throw error;
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
            
            return {
                success: true,
                userId: user._id,
                accountId: account.id,
                message: 'Account updated successfully'
            };
        } else {
            return {
                success: false,
                accountId: account.id,
                message: 'User not found for account'
            };
        }
    } catch (error) {
        console.error('Error handling account updated:', error);
        throw error;
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
        
        return {
            success: true,
            paymentIntentId: paymentIntent.id,
            message: 'Payment failure handled'
        };
    } catch (error) {
        console.error('Error handling payment failed:', error);
        throw error;
    }
};

/**
 * @desc    Get webhook events for user
 * @route   GET /api/webhooks/events
 * @access  Private
 */
export const getWebhookEvents = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const { page = 1, limit = 20, eventType, status } = req.query;
    
    const query = { userId };
    
    if (eventType) {
        query.eventType = eventType;
    }
    
    if (status) {
        query.status = status;
    }
    
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: [
            { path: 'pageId', select: 'title slug productName' },
            { path: 'paymentId', select: 'amount currency status customerEmail' }
        ]
    };
    
    const events = await WebhookEvent.paginate(query, options);
    
    res.status(200).json({
        status: 'success',
        data: events
    });
});

/**
 * @desc    Get webhook event details
 * @route   GET /api/webhooks/events/:eventId
 * @access  Private
 */
export const getWebhookEventDetails = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const { eventId } = req.params;
    
    const event = await WebhookEvent.findOne({ 
        _id: eventId, 
        userId 
    }).populate([
        { path: 'pageId', select: 'title slug productName' },
        { path: 'paymentId', select: 'amount currency status customerEmail customerName' }
    ]);
    
    if (!event) {
        res.status(404);
        throw new Error('Webhook event not found');
    }
    
    res.status(200).json({
        status: 'success',
        data: { event }
    });
});

/**
 * @desc    Get webhook statistics
 * @route   GET /api/webhooks/stats
 * @access  Private
 */
export const getWebhookStats = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const stats = await WebhookEvent.aggregate([
        {
            $match: {
                userId: userId,
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: null,
                totalEvents: { $sum: 1 },
                completedEvents: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                failedEvents: {
                    $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                },
                eventsByType: {
                    $push: {
                        eventType: '$eventType',
                        status: '$status'
                    }
                }
            }
        }
    ]);
    
    const eventTypeStats = await WebhookEvent.aggregate([
        {
            $match: {
                userId: userId,
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$eventType',
                count: { $sum: 1 },
                completed: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                failed: {
                    $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                }
            }
        }
    ]);
    
    const result = stats[0] || {
        totalEvents: 0,
        completedEvents: 0,
        failedEvents: 0
    };
    
    result.successRate = result.totalEvents > 0 
        ? Math.round((result.completedEvents / result.totalEvents) * 100) 
        : 100;
    result.eventTypeStats = eventTypeStats;
    
    res.status(200).json({
        status: 'success',
        data: result
    });
});

// Mock payment completion handler
export const completeMockPayment = asyncHandler(async (req, res) => {
    console.log('Mock payment completion request received:', {
        body: req.body,
        sessionId: req.body?.sessionId
    });
    
    const { sessionId } = req.body;
    
    if (!sessionId) {
        console.log('No session ID provided');
        return res.status(400).json({
            status: 'error',
            message: 'Session ID is required'
        });
    }
    
    try {
        // Find the payment by session ID
        const payment = await Payment.findOne({ stripeSessionId: sessionId });
        console.log('Found payment:', payment ? 'Yes' : 'No');
        
        if (!payment) {
            return res.status(404).json({
                status: 'error',
                message: 'Payment session not found'
            });
        }

        // Update payment status to completed
        payment.status = 'succeeded';
        payment.stripePaymentIntentId = `pi_mock_${Date.now()}`;
        await payment.save();

        // Create a submission record if this is from a checkout page
        const page = await CheckoutPage.findById(payment.pageId);
        if (page) {
            const submission = new Submission({
                pageId: payment.pageId,
                userId: page.userId,
                paymentId: payment._id,
                formData: req.body.formData || {},
                paymentStatus: 'completed',
                paymentAmount: payment.amount,
                customerEmail: req.body.customerEmail || 'test@example.com',
            });
            
            await submission.save();
        }

        res.status(200).json({
            status: 'success',
            message: 'Mock payment completed successfully',
            data: {
                paymentId: payment._id,
                sessionId: sessionId
            }
        });
    } catch (error) {
        console.error('Mock payment completion error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to complete mock payment'
        });
    }
}); 