const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        console.log("Authorization Header:", authHeader); // לוג לבדיקה
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({ error: 'Please authenticate.' });
        }
        
        const token = authHeader.replace('Bearer ', '');
        
        // כאן אנחנו משתמשים ב-process.env במקום בטקסט קשיח
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = decoded;
        next();
    } catch (error) {
        console.log("Auth Error:", error.message); // לוג לבדיקה
        res.status(401).send({ error: 'Invalid token.' });
    }
};

module.exports = auth;