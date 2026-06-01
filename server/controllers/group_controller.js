const Group = require('../models/Group');

// 1. יצירת קבוצה חדשה - עם הגנה על נתוני משתמש
const createGroup = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).send({ message: "User not authenticated" });
        }

        const { name, isPrivate } = req.body;
        if (!name) return res.status(400).send({ message: "Group name is required" });

        const group = new Group({
            name,
            isPrivate: isPrivate || false,
            admin: req.user.id,
            members: [req.user.id]
        });

        await group.save();
        res.status(201).send(group);
    } catch (error) {
        res.status(400).send({ message: "Failed to create group", error: error.message });
    }
};

// 2. משיכת כל הקבוצות
const getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find()
            .populate('admin', 'username')
            .sort({ createdAt: -1 });
        res.status(200).send(groups);
    } catch (error) {
        res.status(500).send({ message: "Error fetching groups", error: error.message });
    }
};

// 3. עדכון קבוצה - עם הגנה מפני גישה לא מורשית
const updateGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).send({ message: "Group not found" });

        if (group.admin.toString() !== req.user.id) {
            return res.status(403).send({ message: "Permission denied" });
        }

        // מניעת דריסה של admin או members בטעות דרך req.body
        const { name, isPrivate } = req.body;
        const updatedGroup = await Group.findByIdAndUpdate(
            req.params.id, 
            { $set: { name, isPrivate } }, 
            { new: true }
        );
        res.status(200).send(updatedGroup);
    } catch (error) {
        res.status(400).send({ message: "Update failed", error: error.message });
    }
};

// 4. הצטרפות לקבוצה
const joinGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).send({ message: "Group not found" });

        if (group.members.includes(req.user.id)) {
            return res.status(400).send({ message: "Already a member" });
        }

        group.members.push(req.user.id);
        await group.save();
        res.status(200).send({ message: "Joined successfully" });
    } catch (error) {
        res.status(500).send({ message: "Server error", error: error.message });
    }
};

// 5. מחיקת קבוצה
const deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).send({ message: "Group not found" });

        if (group.admin.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).send({ message: "Not authorized to delete" });
        }

        await Group.findByIdAndDelete(req.params.id);
        res.status(200).send({ message: "Group deleted" });
    } catch (error) {
        res.status(500).send({ message: "Server error", error: error.message });
    }
};

// 6. חיפוש קבוצה מתקדם
const searchGroups = async (req, res) => {
    try {
        const { name, description, isPrivate } = req.query;
        let query = {};

        if (name) query.name = { $regex: name, $options: 'i' };
        if (isPrivate !== undefined) query.isPrivate = isPrivate === 'true';

        const groups = await Group.find(query).populate('admin', 'username');
        res.status(200).send(groups);
    } catch (error) {
        res.status(500).send({ message: "Search failed", error: error.message });
    }
};

module.exports = { 
    createGroup, 
    getAllGroups,
    updateGroup,
    joinGroup, 
    deleteGroup,
    searchGroups
};