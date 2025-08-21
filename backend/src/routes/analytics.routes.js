import express from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

// Dashboard analytics
router.get('/dashboard', analyticsController.getDashboardAnalytics);

// Payment analytics
router.get('/payments', analyticsController.getUserPaymentAnalytics);
router.get('/payments/status', analyticsController.getPaymentStatus);

// Revenue analytics
router.get('/revenue', analyticsController.getRevenueAnalytics);

// Page-specific analytics
router.get('/pages/:pageId', analyticsController.getPageAnalytics);

// Stripe account status
router.get('/stripe-status', analyticsController.getStripeAccountStatus);

export default router;
