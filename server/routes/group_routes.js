const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group_controller');
const auth = require('../middleware/auth');
const isGroupAdmin = require('../middleware/admin');
const authMiddleware = require('../middleware/auth');
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

// קבלת כל הקבוצות (פתוח לכל משתמש מחובר)
router.get('/', auth, groupController.getAllGroups); 

// יצירת קבוצה חדשה (פתוח לכל משתמש מחובר)
router.post('/', auth, groupController.createGroup);

// הצטרפות לקבוצה (פתוח לכל משתמש מחובר)
router.post('/:id/join', auth, groupController.joinGroup);

// מחיקת קבוצה - הוספנו כאן את isGroupAdmin כדי שרק המנהל יוכל למחוק
router.delete('/:id', auth, isGroupAdmin, groupController.deleteGroup);

router.delete('/:groupId/member/:memberId', auth, groupController.removeMember);

// אישור חבר בקבוצה - כבר היה מוגן ע"י isGroupAdmin
router.post('/:groupId/approve/:memberId', auth, isGroupAdmin, groupController.approveMember);

router.get('/:groupId/requests', authMiddleware, groupController.getGroupRequests);

// בתוך group_routes.js, הוסיפי את השורה הזו:
router.get('/:id', auth, groupController.getGroupById);

// בתוך קובץ ה-Routes של הקבוצות
router.get('/:groupId/members', auth, groupController.getGroupMembers);

router.put('/:id', auth, groupController.updateGroup);

module.exports = router;