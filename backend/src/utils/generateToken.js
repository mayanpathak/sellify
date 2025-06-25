import jwt from 'jsonwebtoken';

const generateToken = (userId, res) => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is not set');
        }
        
        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        });

        const cookieOptions = {
            expires: new Date(
                Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        };

        res.cookie('jwt', token, cookieOptions);

        return token;
    } catch (error) {
        console.error('❌ Token generation error:', error);
        throw error;
    }
};

export default generateToken;
