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
export const connectStripeAccount = async (userId, accountType = 'real') => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Check if user already has a Stripe account
    if (user.stripeAccountId) {
        return {
            message: 'Stripe account already connected.',
            stripeAccountId: user.stripeAccountId,
            onboardingUrl: null,
            isMock: user.stripeAccountId.startsWith('acct_mock_'),
        };
    }

    if (accountType === 'mock') {
        // Create a mock Stripe account for development/testing
        const mockStripeAccountId = `acct_mock_${Date.now()}`;
        
        await User.findByIdAndUpdate(userId, {
            stripeAccountId: mockStripeAccountId,
            stripeAccountType: 'mock', // Track account type
        });

        return {
            message: 'Mock Stripe account created for testing purposes.',
            stripeAccountId: mockStripeAccountId,
            onboardingUrl: null, // No onboarding needed for mock
            isMock: true,
        };
    }

    try {
        // Check if real Stripe is configured
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key_here') {
            throw new Error('Stripe is not configured. Please set up your Stripe API keys or use mock mode.');
        }

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
            stripeAccountType: 'real', // Track account type
        });

        return {
            message: 'Stripe account created successfully.',
            stripeAccountId: account.id,
            onboardingUrl: accountLink.url,
            isMock: false,
        };
    } catch (error) {
        console.error('Stripe account creation failed:', error);
        
        // If Stripe Connect is not enabled, automatically create mock account as fallback
        if (error.message.includes('signed up for Connect')) {
            console.log('Stripe Connect not available, creating mock account as fallback...');
            
            // Create a mock Stripe account as fallback
            const mockStripeAccountId = `acct_mock_${Date.now()}`;
            
            await User.findByIdAndUpdate(userId, {
                stripeAccountId: mockStripeAccountId,
                stripeAccountType: 'mock', // Track account type
            });

            return {
                message: 'Stripe Connect is not available. Created mock account for testing instead.',
                stripeAccountId: mockStripeAccountId,
                onboardingUrl: null,
                isMock: true,
                fallbackToMock: true,
            };
        }
        
        throw new Error(`Failed to create Stripe account: ${error.message}`);
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

    // Check if this is a mock account
    const isMockAccount = user.stripeAccountId.startsWith('acct_mock_');

    if (isMockAccount) {
        // Handle mock payment flow - create a mock checkout page
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
            message: 'Mock Stripe checkout session created for testing.',
            url: `${process.env.CLIENT_URL}/mock-checkout?session_id=${mockSessionId}&page_id=${pageId}`,
            sessionId: mockSessionId,
            paymentId: payment._id,
            isMock: true,
        };
    }

    // If user has a mock account but Stripe is configured, create a real account
    if (user.stripeAccountId.startsWith('acct_mock_') && process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here') {
        console.log('User has mock account but Stripe is configured - creating real Stripe account');
        
        try {
            // Create real Stripe Express account
            const account = await stripe.accounts.create({
                type: 'express',
                country: 'US',
                email: (await User.findById(userId)).email,
            });

            // Update user with real account ID
            await User.findByIdAndUpdate(userId, {
                stripeAccountId: account.id,
            });

            // Update user object for this request
            user.stripeAccountId = account.id;
            
            console.log(`Created real Stripe account ${account.id} to replace mock account`);
        } catch (error) {
            console.error('Failed to create real Stripe account:', error);
            throw new Error('Unable to create Stripe account. Please try connecting your Stripe account again.');
        }
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
            payment_intent_data: {
                application_fee_amount: Math.round(totalAmount * 0.05), // 5% platform fee
            },
            metadata: {
                pageId: pageId,
                userId: userId,
                totalAmount: totalAmount.toString(),
            },
        }, {
            stripeAccount: user.stripeAccountId, // Stripe Connect - pass as option
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
        throw error;
    }
};
