import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import { getPlanLimits } from '../middleware/planCheck.middleware.js';

/**
 * @desc    Get available plans and user's current plan info
 * @route   GET /api/plans
 * @access  Private
 */
export const getPlans = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).populate('createdPages');
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const currentPlan = user.plan || 'free';
    const currentLimits = getPlanLimits(currentPlan);
    const pagesUsed = user.createdPages.length;

    const plans = [
        {
            id: 'free',
            name: 'Free',
            description: 'Perfect for getting started',
            maxPages: 3,
            price: 0,
            features: [
                'Up to 3 checkout pages',
                'Basic form fields',
                'Email notifications',
                'Basic analytics',
                'Community support'
            ],
            current: currentPlan === 'free'
        },
        {
            id: 'builder',
            name: 'Builder',
            description: 'Great for growing businesses',
            maxPages: 10,
            price: 0, // Free for testing
            features: [
                'Up to 10 checkout pages',
                'All form field types',
                'Custom styling options',
                'Advanced analytics',
                'Priority email support',
                'Custom branding',
                'Webhook integrations'
            ],
            popular: true,
            current: currentPlan === 'builder'
        },
        {
            id: 'pro',
            name: 'Pro',
            description: 'Everything you need to scale',
            maxPages: 'Unlimited',
            price: 0, // Free for testing
            features: [
                'Unlimited checkout pages',
                'All form field types',
                'Complete customization',
                'Advanced analytics & reports',
                'Priority phone & email support',
                'Custom branding',
                'Advanced webhook integrations',
                'Full API access',
                'White-label solution'
            ],
            current: currentPlan === 'pro'
        }
    ];

    res.status(200).json({
        status: 'success',
        data: {
            plans,
            currentPlan: {
                id: currentPlan,
                maxPages: currentLimits.maxPages,
                pagesUsed,
                pagesRemaining: currentLimits.maxPages === Infinity ? 'Unlimited' : Math.max(0, currentLimits.maxPages - pagesUsed),
                usagePercentage: currentLimits.maxPages === Infinity ? 0 : Math.min(100, (pagesUsed / currentLimits.maxPages) * 100)
            }
        }
    });
});

/**
 * @desc    Upgrade user's plan (free for testing)
 * @route   POST /api/plans/upgrade
 * @access  Private
 */
export const upgradePlan = asyncHandler(async (req, res) => {
    const { planId } = req.body;
    const userId = req.user._id || req.user.id;

    if (!planId || !['free', 'builder', 'pro'].includes(planId)) {
        res.status(400);
        throw new Error('Invalid plan ID. Must be one of: free, builder, pro');
    }

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if user is trying to downgrade (not allowed if they have more pages than the new limit)
    const newLimits = getPlanLimits(planId);
    const currentPagesCount = await User.findById(userId).populate('createdPages').then(u => u.createdPages.length);
    
    if (newLimits.maxPages !== Infinity && currentPagesCount > newLimits.maxPages) {
        res.status(400);
        throw new Error(`Cannot downgrade to ${planId} plan. You have ${currentPagesCount} pages but the ${planId} plan only allows ${newLimits.maxPages} pages. Please delete some pages first.`);
    }

    // Update user's plan
    user.plan = planId;
    
    // Remove trial expiration for non-free plans (if exists)
    if (planId !== 'free') {
        user.trialExpiresAt = null;
    }
    
    await user.save();

    res.status(200).json({
        status: 'success',
        message: `Successfully upgraded to ${planId} plan!`,
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                plan: user.plan,
                trialExpiresAt: user.trialExpiresAt
            }
        }
    });
});

/**
 * @desc    Get user's plan usage statistics
 * @route   GET /api/plans/usage
 * @access  Private
 */
export const getPlanUsage = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).populate('createdPages');
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const currentPlan = user.plan || 'free';
    const limits = getPlanLimits(currentPlan);
    const pagesUsed = user.createdPages.length;
    const pagesRemaining = limits.maxPages === Infinity ? 'Unlimited' : Math.max(0, limits.maxPages - pagesUsed);
    const usagePercentage = limits.maxPages === Infinity ? 0 : Math.min(100, (pagesUsed / limits.maxPages) * 100);
    const isNearLimit = usagePercentage >= 80;
    const isAtLimit = limits.maxPages !== Infinity && pagesUsed >= limits.maxPages;

    res.status(200).json({
        status: 'success',
        data: {
            plan: currentPlan,
            limits: {
                maxPages: limits.maxPages
            },
            usage: {
                pagesUsed,
                pagesRemaining,
                usagePercentage: Math.round(usagePercentage),
                isNearLimit,
                isAtLimit
            }
        }
    });
});
