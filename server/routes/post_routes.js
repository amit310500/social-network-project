const express = require('express');
const router = express.Router();
const postController = require('../controllers/post_controller');
const auth = require('../middleware/auth');
const postsController = require('../controllers/post_controller'); // וודאי שהנתיב נכון לתיקיית הקונטרולרים שלך

// הוספתי auth גם לנתיב הזה כדי שיהיה עקבי
router.get('/', auth, postController.getAllPosts); 
router.post('/', auth, postController.createPost);
router.delete('/:id', auth, postController.deletePost);
router.put('/:id', auth, postController.updatePost);
router.get('/search', auth, postController.searchPosts);

// כאן התיקון לנתיב של הפיד האישי:
// השתמשתי ב-getPersonalFeed שהגדרנו ב-Controller
router.get('/my-feed', auth, postController.getPersonalFeed); 
router.get('/user/:userId', auth, postController.getUserPosts);

// בתוך posts_routes.js
router.get('/stats', postsController.getStats); // חייב להיות לפני ה-get של ה-ID

module.exports = router;