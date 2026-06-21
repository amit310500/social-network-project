const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const auth = require('../middleware/auth'); // ודאי שהנתיב לקובץ נכון

// 1. Public Routes (נתיבים פתוחים לכולם)
// Registration: POST /api/users/register
router.post('/register', userController.register);

// Login: POST /api/users/login
router.post('/login', userController.login);

// 2. Private Routes (נתיבים שדורשים התחברות - אופציונלי להמשך)
// לדוגמה: קבלת פרטי המשתמש המחובר כרגע
// router.get('/profile', authMiddleware, userController.getProfile);

// קבלת פרטי המשתמש הנוכחי
router.get('/me', auth, userController.getMe);

router.put('/:id', auth, userController.updateUser);      // עדכון
router.delete('/:id', auth, userController.deleteUser);   // מחיקה

router.get('/search/users', auth, userController.searchUsers);

module.exports = router;