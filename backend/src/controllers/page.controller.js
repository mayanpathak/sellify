import asyncHandler from 'express-async-handler';
import CheckoutPage from '../models/CheckoutPage.js';
import Submission from '../models/Submission.js';
import User from '../models/user.model.js';
import generateUniqueSlug from '../utils/slugify.js';

// @desc    Create a new checkout page
// @route   POST /api/pages
// @access  Private
export const createPage = asyncHandler(async (req, res) => {
    const { title, slug, ...rest } = req.body;
    const userId = req.user._id || req.user.id;

    let finalSlug = slug;
    if (!slug) {
        finalSlug = await generateUniqueSlug(title);
    } else {
        const existing = await CheckoutPage.findOne({ slug });
        if (existing) {
            res.status(400);
            throw new Error('URL slug is already taken.');
        }
    }

    const newPage = await CheckoutPage.create({ userId, title, slug: finalSlug, ...rest });
    await User.findByIdAndUpdate(userId, { $push: { createdPages: newPage._id } });

    res.status(201).json({ status: 'success', data: { page: newPage } });
});

// @desc    Get all pages created by the user
// @route   GET /api/pages
// @access  Private
export const getUserPages = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const pages = await CheckoutPage.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: pages.length, data: { pages } });
});

// @desc    Get a page by its slug
// @route   GET /api/pages/:slug
// @access  Public
export const getPageBySlug = asyncHandler(async (req, res) => {
    const page = await CheckoutPage.findOne({ slug: req.params.slug });
    if (!page) {
        res.status(404);
        throw new Error('Checkout page not found.');
    }

    // Get page owner's Stripe connection status
    const pageOwner = await User.findById(page.userId).select('stripeAccountId');
    const isStripeConnected = !!pageOwner?.stripeAccountId;

    res.status(200).json({ 
        status: 'success', 
        data: { 
            page,
            isStripeConnected 
        } 
    });
});

// @desc    Update a checkout page
// @route   PATCH /api/pages/:id
// @access  Private
export const updatePage = asyncHandler(async (req, res) => {
    const page = await CheckoutPage.findById(req.params.id);
    if (!page) {
        res.status(404);
        throw new Error('Page not found.');
    }

    const userId = req.user._id || req.user.id;
    if (page.userId.toString() !== userId.toString()) {
        res.status(403);
        throw new Error('You are not authorized to update this page.');
    }

    if (req.body.slug) {
        const existing = await CheckoutPage.findOne({ slug: req.body.slug });
        if (existing && existing._id.toString() !== req.params.id) {
            res.status(400);
            throw new Error('URL slug is already taken.');
        }
    }

    const updatedPage = await CheckoutPage.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ status: 'success', data: { page: updatedPage } });
});

// @desc    Delete a checkout page
// @route   DELETE /api/pages/:id
// @access  Private
export const deletePage = asyncHandler(async (req, res) => {
    const page = await CheckoutPage.findById(req.params.id);
    if (!page) {
        res.status(404);
        throw new Error('Page not found.');
    }

    const userId = req.user._id || req.user.id;
    if (page.userId.toString() !== userId.toString()) {
        res.status(403);
        throw new Error('You are not authorized to delete this page.');
    }

    await page.deleteOne();
    await User.findByIdAndUpdate(userId, { $pull: { createdPages: req.params.id } });

    res.status(204).json({ status: 'success', data: null });
});


