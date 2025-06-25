/**
 * Validates that all required environment variables are present
 */
export const validateEnvironment = () => {
    const requiredVars = [
        'MONGO_URI',
        'JWT_SECRET',
        'CLIENT_URL'
    ];

    const optionalVars = {
        'JWT_EXPIRES_IN': '7d',
        'JWT_COOKIE_EXPIRES_IN': '7',
        'TRIAL_DURATION_DAYS': '7',
        'NODE_ENV': 'development',
        'PORT': '5000'
    };

    const missing = [];
    
    // Check required variables
    requiredVars.forEach(varName => {
        if (!process.env[varName]) {
            missing.push(varName);
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

    // Set defaults for optional variables
    Object.entries(optionalVars).forEach(([varName, defaultValue]) => {
        if (!process.env[varName]) {
            process.env[varName] = defaultValue;
            console.log(`ℹ️  Using default value for ${varName}: ${defaultValue}`);
        }
    });

    console.log('✅ Environment variables validated successfully');
}; 