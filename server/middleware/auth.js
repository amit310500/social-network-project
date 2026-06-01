const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({ error: 'Please authenticate. Token missing.' });
        }
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, 'YOUR_SECRET_KEY'); // החליפו ב-process.env.JWT_SECRET אם אתם עובדים עם .env לשדרוג הציון!
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate. Invalid token.' });
    }
};

module.exports = auth;