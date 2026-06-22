const express = require('express');
const router = express.Router();
const postController = require('../controllers/post_controller');
const groupController = require('../controllers/group_controller');
const auth = require('../middleware/auth');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// הוספתי auth גם לנתיב הזה כדי שיהיה עקבי
router.get('/', auth, postController.getAllPosts); 
router.post('/', auth, postController.createPost);
// הוספת הנתיב להעלאת מדיה
router.post('/upload-media', auth, upload.single('media'), postController.uploadMedia);

router.delete('/:id', auth, postController.deletePost);
router.put('/:id', auth, postController.updatePost);
router.get('/search/posts', auth, postController.searchPosts);

// כאן התיקון לנתיב של הפיד האישי:
// השתמשתי ב-getPersonalFeed שהגדרנו ב-Controller
router.get('/my-feed', auth, postController.getPersonalFeed); 
router.get('/user/:userId', auth, postController.getUserPosts);

router.get('/stats', postController.getStats);

module.exports = router;