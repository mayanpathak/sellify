import express from 'express';
import * as stripeController from '../controllers/stripe.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Stripe account connection routes
router.post('/connect', protect, stripeController.connectAccount);
router.get('/status', protect, stripeController.getConnectionStatus);
router.delete('/disconnect', protect, stripeController.disconnectAccount);

// Stripe session routes (public - anyone can pay)
router.post('/session/:pageId', stripeController.createSession);

export default router;
