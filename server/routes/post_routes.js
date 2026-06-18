const express = require('express');
const router = express.Router();
const postController = require('../controllers/post_controller');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// הוספתי auth גם לנתיב הזה כדי שיהיה עקבי
router.get('/', auth, postController.getAllPosts); 
router.post('/', auth, postController.createPost);
// הוספת הנתיב להעלאת וידאו
router.post('/upload-video', auth, upload.single('video'), postController.uploadVideo);

router.delete('/:id', auth, postController.deletePost);
router.put('/:id', auth, postController.updatePost);
router.get('/search', auth, postController.searchPosts);

// כאן התיקון לנתיב של הפיד האישי:
// השתמשתי ב-getPersonalFeed שהגדרנו ב-Controller
router.get('/my-feed', auth, postController.getPersonalFeed); 
router.get('/user/:userId', auth, postController.getUserPosts);

router.get('/stats', postController.getStats);

module.exports = router;