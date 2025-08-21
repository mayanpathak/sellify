import express from 'express';
import { 
    handleStripeWebhook,
    getWebhookEvents,
    getWebhookEventDetails,
    getWebhookStats,
    completeMockPayment
} from '../controllers/webhook.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/webhooks/stripe
 * @desc    Handle Stripe webhook events
 * @access  Public (verified with Stripe signature)
 * 
 * Note: This route needs raw body, so it should be mounted
 * before the JSON body parser middleware
 */
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Protected webhook management routes
router.get('/events', protect, getWebhookEvents);
router.get('/events/:eventId', protect, getWebhookEventDetails);
router.get('/stats', protect, getWebhookStats);

// Mock payment completion route (needs JSON parsing)
router.post('/mock-payment-complete', express.json(), completeMockPayment);

export default router; 