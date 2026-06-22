const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware: Protects routes by verifying the JWT token.
 * Extracts the token from the 'Authorization' header and validates it.
 */
const auth = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        console.log("Authorization Header:", authHeader); 
        
        // Verify that the header exists and uses the 'Bearer' scheme
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({ error: 'Please authenticate.' });
        }
        
        // Extract the actual token string
        const token = authHeader.replace('Bearer ', '');
        
        // Verify the token using the secret key stored in environment variables
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach the decoded user information to the request object for use in controllers
        req.user = decoded;
        next();
    } catch (error) {
        console.log("Auth Error:", error.message); 
        res.status(401).send({ error: 'Invalid token.' });
    }
};

module.exports = auth;