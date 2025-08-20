import express from 'express';
import * as planController from '../controllers/plan.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.middleware.js';

const router = express.Router();

// All plan routes require authentication
router.use(protect);

// Validation for plan upgrade
const validatePlanUpgrade = [
    body('planId')
        .isIn(['free', 'builder', 'pro'])
        .withMessage('Plan ID must be one of: free, builder, pro'),
    handleValidationErrors
];

// Plan routes
router.get('/', planController.getPlans);
router.get('/usage', planController.getPlanUsage);
router.post('/upgrade', validatePlanUpgrade, planController.upgradePlan);

export default router;
