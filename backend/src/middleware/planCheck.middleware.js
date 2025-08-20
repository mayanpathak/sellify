import User from '../models/user.model.js';

const planLimits = {
    free: { maxPages: 3 },
    builder: { maxPages: 10 },
    pro: { maxPages: Infinity }
};

/**
 * Get plan limits for a specific plan
 * @param {string} plan - The plan name
 * @returns {object} Plan limits
 */
export const getPlanLimits = (plan) => {
    return planLimits[plan] || planLimits.free;
};

/**
 * Middleware to check if a user can create a new resource based on their plan.
 * @param {string} resourceType - The type of resource being created (e.g., 'page').
 */
export const checkPlanLimits = (resourceType) => async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const user = await User.findById(userId).populate('createdPages');
        
        if (!user) {
            return res.status(401).json({ status: 'fail', message: 'User not found.' });
        }

        // No trial expiration check - only page limits matter

        const plan = user.plan || 'free';
        const limit = planLimits[plan]?.maxPages || planLimits.free.maxPages;

        if (resourceType === 'page') {
            if (user.createdPages.length >= limit) {
                return res.status(403).json({
                    status: 'fail',
                    message: `You have reached the maximum of ${limit === Infinity ? 'unlimited' : limit} pages for the ${plan} plan. Please upgrade your plan to create more.`,
                    code: 'PLAN_LIMIT_REACHED',
                    currentPlan: plan,
                    currentPages: user.createdPages.length,
                    maxPages: limit
                });
            }
        }
        
        next();
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Error checking plan limits.' });
    }
};
