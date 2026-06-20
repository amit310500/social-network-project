const Group = require('../models/Group');
const Post = require('../models/Post');

// 1. יצירת קבוצה חדשה - עם הגנה על נתוני משתמש
const createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        // יצירת הקבוצה עם השדות הרלוונטיים
        const newGroup = new Group({
            name,
            admin: req.user.id,
            members: [req.user.id] // הוספנו את עצמך כחברה ראשונה!
        });
        
        await newGroup.save();
        res.status(201).json(newGroup);
    } catch (err) {
        res.status(400).json({ message: "Failed to create group", error: err.message });
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

        // הבדיקה הקריטית: אם השדה לא מערך, נאפס אותו למערך ריק
        if (!Array.isArray(group.pendingRequests)) {
            group.pendingRequests = []; 
        }

        if (group.pendingRequests.includes(req.user.id)) {
            return res.status(400).send({ message: "Already requested to join" });
        }

        group.pendingRequests.push(req.user.id);
        await group.save();
        
        return res.send({ message: "Request sent successfully, waiting for admin approval" });
    } catch (err) {
        res.status(500).send({ error: err.message });
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

        await Post.deleteMany({ group: req.params.id });
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

const approveMember = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const group = await Group.findById(groupId);
        
        // מוודאים שהוא באמת בממתינים
        if (!group.pendingRequests.includes(memberId)) {
            return res.status(400).send({ message: "No join request found for this user" });
        }

        // העברה
        group.pendingRequests = group.pendingRequests.filter(id => id.toString() !== memberId);
        group.members.push(memberId);
        
        await group.save();
        res.send({ message: "Member approved" });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

const getGroupRequests = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        // בדיקה האם המשתמש המחובר הוא המנהל
        if (group.adminId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only admin can view requests" });
        }
        res.json(group.requests); // מחזיר את רשימת הממתינים
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// הוסף פונקציה זו ב-group_controller.js או עדכן את הפונקציה ששולפת את הקבוצה
const getGroupDetails = async (req, res) => {
    try {
        // שימוש ב-populate כדי לקבל את פרטי המשתמשים שממתינים
        const group = await Group.findById(req.params.id)
            .populate('admin', 'username')
            .populate('pendingRequests', 'username'); 
        
        if (!group) return res.status(404).send({ message: "Group not found" });
        res.status(200).send(group);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

const getGroupById = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('admin', 'username')
            .populate('pendingRequests', 'username'); 
        
        // הדפסה לטרמינל בשרת - זה השלב הכי חשוב!
        console.log("DEBUG: Group found in DB:", JSON.stringify(group, null, 2));

        if (!group) return res.status(404).json({ message: "Group not found" });
        res.status(200).json(group);
    } catch (err) {
        console.error("DEBUG: Error in getGroupById:", err);
        res.status(500).json({ error: err.message });
    }
};

const getGroupMembers = async (req, res) => {
    try {
        // מציאת הקבוצה לפי ID ושליפת המשתמשים המלאים מתוך ה-members
        const group = await Group.findById(req.params.groupId)
                                 .populate('members', 'username email'); // מחזיר רק שם ואימייל

        if (!group) return res.status(404).send({ message: "Group not found" });

        res.json(group.members); // מחזיר רק את רשימת המשתמשים
    } catch (error) {
        res.status(500).send({ message: "Error fetching members" });
    }
};

module.exports = { 
    createGroup, 
    getAllGroups,
    updateGroup,
    joinGroup, 
    deleteGroup,
    searchGroups,
    approveMember,
    getGroupRequests,
    getGroupDetails,
    getGroupById,
    getGroupMembers
};