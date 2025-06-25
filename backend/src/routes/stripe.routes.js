import express from 'express';
import * as stripeController from '../controllers/stripe.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/connect', protect, stripeController.connectAccount);
router.post('/session/:pageId', protect, stripeController.createSession);

export default router;
