const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group_controller');
const auth = require('../middleware/auth'); // הגנה על הנתיבים

router.post('/', auth, groupController.createGroup); // יצירת קבוצה
router.post('/:id/join', auth, groupController.joinGroup); // הצטרפות
router.delete('/:id', auth, groupController.deleteGroup); // מחיקה (עם בדיקת אדמין בתוך הקונטרולר)

module.exports = router;