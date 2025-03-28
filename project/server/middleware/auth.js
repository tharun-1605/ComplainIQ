import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
    console.log('Received token:', req.header('Authorization')); // Log the received token
        console.log('No authentication token found'); // Log if no token is found
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.log('Decoded token:', decoded); // Log the decoded token
            return res.status(401).json({ message: 'No authentication token found' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded); // Log the decoded token
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Authentication error:', error); // Log the error
        res.status(401).json({ message: 'Authentication failed' });
        res.status(401).json({ message: 'Authentication failed' });
    }
};

export default auth;
