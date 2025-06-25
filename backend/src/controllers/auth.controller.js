import asyncHandler from 'express-async-handler';
import * as authService from '../services/auth.service.js';
import generateToken from '../utils/generateToken.js';
import User from '../models/user.model.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
    try {
        // Step 1: Create user
        const user = await authService.registerUser(req.body);
        
        // Step 2: Generate token
        const token = generateToken(user._id, res);
        
        // Step 3: Send response
        // Ensure user object is serializable
        const cleanUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            plan: user.plan,
            trialExpiresAt: user.trialExpiresAt,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        
        const response = {
            status: 'success',
            token,
            data: { user: cleanUser },
        };
        
        res.status(201).json(response);
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        throw error; // Let asyncHandler handle it
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
    const user = await authService.loginUser(req.body);
    const token = generateToken(user._id, res);
    res.status(200).json({
        status: 'success',
        token,
        data: { user },
    });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
    });
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
    // req.user is added by auth middleware (e.g., protect)
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    
    res.status(200).json({
        status: 'success',
        data: { user },
    });
});
