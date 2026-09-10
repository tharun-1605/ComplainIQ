import jwt from 'jsonwebtoken';

/**
 * Middleware to authenticate requests using a JWT token.
 * 
 * @param {Object} req - The request object, containing headers and other data.
 * @param {Object} res - The response object, used to send responses to the client.
 * @param {Function} next - The next middleware function in the stack.
 * 
 * Logs the received token, verifies it, and attaches the decoded user information to the request object.
 * If authentication fails, responds with a 401 status and an error message.
 */
const auth = (req, res, next) => {
    console.log('Auth middleware triggered'); // Log when middleware is triggered
    console.log('Request path:', req.path); // Log the request path
    console.log('Received token:', req.header('Authorization')); // Log the received token

    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token && req.path !== '/api/user/posts') {
        console.log('No authentication token found'); // Log if no token is found
        return res.status(401).json({ message: 'No authentication token found' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded); // Log the decoded token
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Authentication error:', error); // Log the error
        res.status(401).json({ message: 'Authentication failed' });
    }
};

export default auth;