const Group = require('../models/Group');

const isGroupAdmin = async (req, res, next) => {
    try {
        //const { groupId } = req.params; // או req.body תלוי איך את שולחת
        const idToCheck = req.params.id || req.params.groupId;
        const group = await Group.findById(idToCheck);
        //const group = await Group.findById(groupId);
        
        if (!group) return res.status(404).json({ message: "Group not found" });
        
        // בדיקה: האם המשתמש המחובר הוא המנהל של הקבוצה הזו?
        if (group.admin.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access Denied: Only group admin can perform this" });
        }
        
        next(); // אם הכל תקין, ממשיכים לפונקציה הבאה
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = isGroupAdmin;