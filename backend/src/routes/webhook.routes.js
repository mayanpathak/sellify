import express from 'express';
import { handleStripeWebhook } from '../controllers/webhook.controller.js';

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

export default router; 