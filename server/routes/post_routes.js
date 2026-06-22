const express = require('express');
const router = express.Router();
const postController = require('../controllers/post_controller');
const groupController = require('../controllers/group_controller');
const auth = require('../middleware/auth');
const multer = require('multer');

// Configure multer for handling media file uploads
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

// Post Management Routes
// ----------------------

// Fetch all posts
router.get('/', auth, postController.getAllPosts); 

// Create a new post
router.post('/', auth, postController.createPost);

// Upload media file (returns URL to be used in posts)
router.post('/upload-media', auth, upload.single('media'), postController.uploadMedia);

// Delete a post
router.delete('/:id', auth, postController.deletePost);

// Update post content
router.put('/:id', auth, postController.updatePost);

// Search posts based on filters
router.get('/search/posts', auth, postController.searchPosts);

// Fetch the authenticated user's personal feed
router.get('/my-feed', auth, postController.getPersonalFeed); 

// Fetch all posts from a specific user
router.get('/user/:userId', auth, postController.getUserPosts);

// Fetch post statistics for dashboard visualizations
router.get('/stats', postController.getStats);

module.exports = router;