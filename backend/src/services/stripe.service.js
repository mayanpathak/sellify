// import User from '../models/user.model.js';
// import CheckoutPage from '../models/page.model.js';

// export const connectStripeAccount = async (userId) => {
//     const mockStripeCustomerId = `cus_mock_${Date.now()}`;
//     await User.findByIdAndUpdate(userId, { stripeCustomerId: mockStripeCustomerId });
    
//     return {
//         success: true,
//         message: 'Stripe account connected successfully (mocked).',
//         stripeCustomerId: mockStripeCustomerId,
//         onboardingUrl: `https://connect.stripe.com/mock/onboarding/${mockStripeCustomerId}`
//     };
// };

// export const createCheckoutSession = async (pageId, userId) => {
//     const page = await CheckoutPage.findById(pageId);
//     if (!page) {
//         throw new Error('Checkout page not found.');
//     }

//     const user = await User.findById(userId);
//     if (!user || !user.stripeCustomerId) {
//         throw new Error('User has not connected a Stripe account.');
//     }

//     return {
//         success: true,
//         message: "Stripe checkout session created (mocked).",
//         url: `https://checkout.stripe.com/mock/pay/cs_test_${Date.now()}`
//     };
// };



import User from '../models/user.model.js';
import CheckoutPage from '../models/CheckoutPage.js';
import stripe from '../config/stripe.js';

/**
 * @desc    Connect a user's Stripe account
 * @param   {string} userId - MongoDB user ID
 * @returns {Promise<object>}
 */
export const connectStripeAccount = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    try {
        // Create Stripe Express account
        const account = await stripe.accounts.create({
            type: 'express',
            country: 'US', // You might want to make this configurable
            email: user.email,
        });

        // Create account link for onboarding
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${process.env.CLIENT_URL}/stripe/refresh`,
            return_url: `${process.env.CLIENT_URL}/stripe/return`,
            type: 'account_onboarding',
        });

        // Save account ID to user
        await User.findByIdAndUpdate(userId, {
            stripeAccountId: account.id,
        });

        return {
            message: 'Stripe account created successfully.',
            stripeAccountId: account.id,
            onboardingUrl: accountLink.url,
        };
    } catch (error) {
        // Fallback to mock for development
        if (process.env.NODE_ENV === 'development') {
            const mockStripeAccountId = `acct_mock_${Date.now()}`;
            
            await User.findByIdAndUpdate(userId, {
                stripeAccountId: mockStripeAccountId,
            });

            return {
                message: 'Stripe account connected successfully (mocked for development).',
                stripeAccountId: mockStripeAccountId,
                onboardingUrl: `https://connect.stripe.com/mock/onboarding/${mockStripeAccountId}`,
            };
        }
        throw error;
    }
};

/**
 * @desc    Create a Stripe Checkout Session
 * @param   {{ pageId: string, userId: string }} params
 * @returns {Promise<object>}
 */
export const createCheckoutSession = async ({ pageId, userId }) => {
    const page = await CheckoutPage.findById(pageId);
    if (!page) {
        throw new Error('Checkout page not found.');
    }

    const user = await User.findById(userId);
    if (!user || !user.stripeAccountId) {
        throw new Error('The page owner has not connected a Stripe account.');
    }

    try {
        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: page.currency || 'usd',
                        product_data: {
                            name: page.productName || 'Unnamed Product',
                            description: page.description || '',
                        },
                        unit_amount: Math.round(page.price * 100), // Convert to cents
                    },
                    quantity: 1,
                },
                // Add order bumps if they exist
                ...((page.orderBumps || []).map(bump => ({
                    price_data: {
                        currency: page.currency || 'usd',
                        product_data: {
                            name: bump.title,
                        },
                        unit_amount: Math.round(bump.price * 100),
                        recurring: bump.recurring ? { interval: 'month' } : undefined,
                    },
                    quantity: 1,
                }))),
            ],
            mode: 'payment',
            success_url:
                page.successRedirectUrl ||
                `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:
                page.cancelRedirectUrl ||
                `${process.env.CLIENT_URL}/page/${page.slug}`,
            stripe_account: user.stripeAccountId, // Stripe Connect
            payment_intent_data: {
                application_fee_amount: Math.round(page.price * 100 * 0.05), // 5% platform fee
            },
            metadata: {
                pageId: pageId,
                userId: userId,
            },
        });

        return {
            success: true,
            message: 'Stripe checkout session created.',
            url: session.url,
            sessionId: session.id,
        };
    } catch (error) {
        // Fallback for development
        if (process.env.NODE_ENV === 'development' && user.stripeAccountId.startsWith('acct_mock_')) {
            return {
                success: true,
                message: 'Stripe checkout session created (mocked for development).',
                url: `https://checkout.stripe.com/mock/pay/cs_test_${Date.now()}`,
                sessionId: `cs_test_mock_${Date.now()}`,
            };
        }
                 throw error;
    }
};
