import slugify from 'slugify';
import CheckoutPage from '../models/CheckoutPage.js';

/**
 * Generates a unique slug. If the initial slug exists, it appends a random suffix.
 * @param {string} title - The string to slugify (e.g., page title).
 * @returns {Promise<string>} A unique, URL-friendly slug.
 */
const generateUniqueSlug = async (title) => {
    let slug = slugify(title, { lower: true, strict: true });
    let existingPage = await CheckoutPage.findOne({ slug });
    
    while (existingPage) {
        // If slug exists, append a short random string
        const randomSuffix = Math.random().toString(36).substring(2, 7);
        slug = `${slugify(title, { lower: true, strict: true })}-${randomSuffix}`;
        existingPage = await CheckoutPage.findOne({ slug });
    }
    
    return slug;
};

export default generateUniqueSlug;

