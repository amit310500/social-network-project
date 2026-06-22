const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const auth = require('../middleware/auth'); 

// Public Routes (Accessible without authentication)
// ------------------------------------------------

// Register a new user
router.post('/register', userController.register);

// Authenticate user and return a JWT
router.post('/login', userController.login);


// Private Routes (Require valid JWT)
// ----------------------------------

// Fetch current authenticated user's profile
router.get('/me', auth, userController.getMe);

// Update user details by ID
router.put('/:id', auth, userController.updateUser); 

// Delete a user account by ID
router.delete('/:id', auth, userController.deleteUser);   

// Search users based on query parameters
router.get('/search/users', auth, userController.searchUsers);

module.exports = router;