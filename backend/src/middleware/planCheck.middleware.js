import User from '../models/user.model.js';

const planLimits = {
    free: { maxPages: 10 },
    builder: { maxPages: 25 },
    pro: { maxPages: Infinity }
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

        // Check if trial has expired for free users
        const now = new Date();
        if (user.plan === 'free' && user.trialExpiresAt && now > user.trialExpiresAt) {
            return res.status(403).json({
                status: 'fail',
                message: 'Your trial has expired. Please upgrade your plan to continue using the service.'
            });
        }

        const plan = user.plan || 'free';
        const limit = planLimits[plan]?.maxPages || planLimits.free.maxPages;

        if (resourceType === 'page') {
            if (user.createdPages.length >= limit) {
                return res.status(403).json({
                    status: 'fail',
                    message: `You have reached the maximum of ${limit === Infinity ? 'unlimited' : limit} pages for the ${plan} plan. Please upgrade your plan to create more.`
                });
            }
        }
        
        next();
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Error checking plan limits.' });
    }
};
