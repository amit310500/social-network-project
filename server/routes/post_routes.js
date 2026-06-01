const express = require('express');
const router = express.Router();
const postController = require('../controllers/post_controller');
const auth = require('../middleware/auth'); // <-- הוספנו את ה-middleware של האבטחה

// 1. משיכת כל הפוסטים - נשאר פתוח (או מוגן ב-auth, לבחירתכם)
router.get('/', postController.getAllPosts); 

// 2. יצירת פוסט חדש - חייב להיות מוגן ב-auth כדי שיקרא את ה-req.user.id!
router.post('/', auth, postController.createPost); 

// 3. מחיקת פוסט - חייב להיות מוגן ב-auth כדי לדעת מי מוחק
router.delete('/:id', auth, postController.deletePost);

// 4. חיפוש פוסטים (כבר הגדרתם נכון עם auth)
router.get('/search', auth, postController.searchPosts);

module.exports = router;