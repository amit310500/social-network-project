const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group_controller');
const auth = require('../middleware/auth');
const isGroupAdmin = require('../middleware/admin');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');


// Configure multer for file uploads
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

// Routes for Group Management
// ---------------------------

// Fetch all available groups
router.get('/', auth, groupController.getAllGroups); 

// Create a new group
router.post('/', auth, groupController.createGroup);

// Request to join a specific group
router.post('/:id/join', auth, groupController.joinGroup);

// Delete a group (Restricted to group admin only)
router.delete('/:id', auth, isGroupAdmin, groupController.deleteGroup);

// Remove a member from a group
router.delete('/:groupId/member/:memberId', auth, groupController.removeMember);

// Approve a pending join request (Restricted to group admin only)
router.post('/:groupId/approve/:memberId', auth, isGroupAdmin, groupController.approveMember);

// Fetch pending join requests
router.get('/:groupId/requests', authMiddleware, groupController.getGroupRequests);

// Fetch group details by ID
router.get('/:id', auth, groupController.getGroupById);

// Fetch all members of a specific group
router.get('/:groupId/members', auth, groupController.getGroupMembers);

// Update group information
router.put('/:id', auth, groupController.updateGroup);

module.exports = router;