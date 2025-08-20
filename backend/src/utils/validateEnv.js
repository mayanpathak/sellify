/**
 * Validates that all required environment variables are present
 */
export const validateEnvironment = () => {
    const requiredVars = [
        'MONGO_URI',
        'JWT_SECRET',
        'CLIENT_URL'
    ];

    // Stripe-specific validation
    const stripeVars = [
        'STRIPE_SECRET_KEY',
        'STRIPE_PUBLISHABLE_KEY',
        'STRIPE_WEBHOOK_SECRET'
    ];

    const optionalVars = {
        'JWT_EXPIRES_IN': '7d',
        'JWT_COOKIE_EXPIRES_IN': '7',
        'TRIAL_DURATION_DAYS': '7',
        'NODE_ENV': 'development',
        'PORT': '5000'
    };

    const missing = [];
    const missingStripe = [];
    
    // Check required variables
    requiredVars.forEach(varName => {
        if (!process.env[varName]) {
            missing.push(varName);
        }
    });

    // Check Stripe variables
    stripeVars.forEach(varName => {
        if (!process.env[varName]) {
            missingStripe.push(varName);
        }
    });

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('\nPlease create a .env file with these variables.');
        process.exit(1);
    }

    if (missingStripe.length > 0) {
        console.warn('⚠️  Missing Stripe environment variables:');
        missingStripe.forEach(varName => {
            console.warn(`   - ${varName}`);
        });
        console.warn('⚠️  Stripe functionality will be limited or use development fallbacks');
        
        // Only exit if in production
        if (process.env.NODE_ENV === 'production') {
            console.error('❌ Stripe environment variables are required in production');
            process.exit(1);
        }
    }

    // Validate Stripe key formats if they exist
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
        console.error('❌ Invalid STRIPE_SECRET_KEY format. Must start with "sk_"');
        process.exit(1);
    }

    if (process.env.STRIPE_PUBLISHABLE_KEY && !process.env.STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
        console.error('❌ Invalid STRIPE_PUBLISHABLE_KEY format. Must start with "pk_"');
        process.exit(1);
    }

    if (process.env.STRIPE_WEBHOOK_SECRET && !process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
        console.error('❌ Invalid STRIPE_WEBHOOK_SECRET format. Must start with "whsec_"');
        process.exit(1);
    }

    // Set defaults for optional variables
    Object.entries(optionalVars).forEach(([varName, defaultValue]) => {
        if (!process.env[varName]) {
            process.env[varName] = defaultValue;
            console.log(`ℹ️  Using default value for ${varName}: ${defaultValue}`);
        }
    });

    console.log('✅ Environment variables validated successfully');
    if (missingStripe.length === 0) {
        console.log('✅ Stripe environment variables configured');
    }
}; 