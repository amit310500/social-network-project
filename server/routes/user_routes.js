const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');

// 1. Public Routes (נתיבים פתוחים לכולם)
// Registration: POST /api/users/register
router.post('/register', userController.register);

// Login: POST /api/users/login
router.post('/login', userController.login);

// 2. Private Routes (נתיבים שדורשים התחברות - אופציונלי להמשך)
// לדוגמה: קבלת פרטי המשתמש המחובר כרגע
// router.get('/profile', authMiddleware, userController.getProfile);

module.exports = router;