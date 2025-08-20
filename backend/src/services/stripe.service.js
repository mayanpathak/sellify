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
import Payment from '../models/Payment.js';
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
        // Calculate total amount including order bumps
        let totalAmount = Math.round(page.price * 100);
        const orderBumpAmount = (page.orderBumps || []).reduce((sum, bump) => 
            sum + Math.round(bump.price * 100), 0
        );
        totalAmount += orderBumpAmount;

        // Create line items
        const lineItems = [
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
        ];

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url:
                page.successRedirectUrl ||
                `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:
                page.cancelRedirectUrl ||
                `${process.env.CLIENT_URL}/page/${page.slug}`,
            stripe_account: user.stripeAccountId, // Stripe Connect
            payment_intent_data: {
                application_fee_amount: Math.round(totalAmount * 0.05), // 5% platform fee
            },
            metadata: {
                pageId: pageId,
                userId: userId,
                totalAmount: totalAmount.toString(),
            },
        });

        // Create pending payment record
        const payment = new Payment({
            userId: userId,
            pageId: pageId,
            stripeSessionId: session.id,
            stripeAccountId: user.stripeAccountId,
            amount: totalAmount,
            currency: page.currency || 'usd',
            applicationFeeAmount: Math.round(totalAmount * 0.05),
            status: 'pending',
            metadata: new Map(Object.entries({
                pageId: pageId,
                userId: userId,
                totalAmount: totalAmount.toString(),
            })),
            stripeCreatedAt: new Date(session.created * 1000),
        });

        await payment.save();

        return {
            success: true,
            message: 'Stripe checkout session created.',
            url: session.url,
            sessionId: session.id,
            paymentId: payment._id,
        };
    } catch (error) {
        console.error('Stripe checkout session creation error:', error);
        
        // Fallback for development
        if (process.env.NODE_ENV === 'development' && user.stripeAccountId.startsWith('acct_mock_')) {
            const mockSessionId = `cs_test_mock_${Date.now()}`;
            
            // Create mock payment record
            const payment = new Payment({
                userId: userId,
                pageId: pageId,
                stripeSessionId: mockSessionId,
                stripeAccountId: user.stripeAccountId,
                amount: Math.round(page.price * 100),
                currency: page.currency || 'usd',
                applicationFeeAmount: Math.round(page.price * 100 * 0.05),
                status: 'pending',
                metadata: new Map(Object.entries({
                    pageId: pageId,
                    userId: userId,
                    mock: 'true'
                })),
                stripeCreatedAt: new Date(),
            });

            await payment.save();

            return {
                success: true,
                message: 'Stripe checkout session created (mocked for development).',
                url: `${process.env.CLIENT_URL}/payment/success?session_id=${mockSessionId}`,
                sessionId: mockSessionId,
                paymentId: payment._id,
            };
        }
        
        throw error;
    }
};
