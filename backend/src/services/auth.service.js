import User from '../models/user.model.js';

export const registerUser = async (userData) => {
    const { name, email, password } = userData;

    if (!name || !email || !password) {
        throw new Error('Please provide name, email, and password');
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('Email already in use');
        }

        const user = await User.create({ name, email, password });
        
        // Remove password from response
        user.password = undefined;
        
        return user;
    } catch (error) {
        console.error('❌ Auth Service error:', error);
        // Handle MongoDB duplicate key error (in case of race condition)
        if (error.code === 11000) {
            throw new Error('Email already in use');
        }
        // Re-throw the original error
        throw error;
    }
};

export const loginUser = async (loginData) => {
    const { email, password } = loginData;

    if (!email || !password) {
        throw new Error('Please provide email and password');
    }
    
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        throw new Error('Incorrect email or password');
    }
    
    user.password = undefined;
    return user;
};
