import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
    try {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return res.status(401).json({ status: 'fail', message: 'You are not logged in! Please log in to get access.' });
        }

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({ status: 'fail', message: 'The user belonging to this token no longer exists.' });
        }
        
        // Add both _id and id for compatibility
        req.user = currentUser;
        req.user.id = currentUser._id;
        next();
    } catch (error) {
        return res.status(401).json({ status: 'fail', message: 'Invalid token or session has expired.' });
    }
};
