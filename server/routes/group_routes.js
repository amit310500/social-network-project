const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group_controller');
const auth = require('../middleware/auth');

// --- כאן הוספנו את ה-GET ---
router.get('/', auth, groupController.getAllGroups); 
// ---------------------------

router.post('/', auth, groupController.createGroup);
router.post('/:id/join', auth, groupController.joinGroup);
router.delete('/:id', auth, groupController.deleteGroup);

module.exports = router;