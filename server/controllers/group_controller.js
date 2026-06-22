const Group = require('../models/Group');
const Post = require('../models/Post');

// 1. Create a new group and assign the creator as admin and first member
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

// 2. Retrieve all groups, sorted by creation date
const getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find()
            .populate('admin', 'username')
            .sort({ createdAt: -1 });
        res.status(200).send(groups);
    } catch (error) {
        res.status(500).send({ message: "Error fetching groups", error: error.message });
    }
    
}

// 3. Request to join a private group
const joinGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).send({ message: "Group not found" });

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

// 4. Delete a group and all associated posts
const deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).send({ message: "Group not found" });

        // Authorization check: only admin can delete
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

// 5. Advanced search for groups based on query parameters
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

// 6. Approve a member's join request
const approveMember = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const group = await Group.findById(groupId);
        
        // Make sure it is really pending
        if (!group.pendingRequests.includes(memberId)) {
            return res.status(400).send({ message: "No join request found for this user" });
        }

        // Move user from pending to members list
        group.pendingRequests = group.pendingRequests.filter(id => id.toString() !== memberId);
        group.members.push(memberId);
        
        await group.save();
        res.send({ message: "Member approved" });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

// 7. Fetches the list of pending join requests for a specific group
// Ensures only the group admin can view these sensitive requests
const getGroupRequests = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (group.adminId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only admin can view requests" });
        }
        res.json(group.requests); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 8. Get details of a group, including populated pending requests
const getGroupDetails = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('admin', 'username')
            .populate('pendingRequests', 'username'); 
        
        if (!group) return res.status(404).send({ message: "Group not found" });
        res.status(200).send(group);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// 9. Fetches a full group object by ID, populating admin and pending request details
const getGroupById = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('admin', 'username')
            .populate('pendingRequests', 'username'); 
        
        console.log("DEBUG: Group found in DB:", JSON.stringify(group, null, 2));

        if (!group) return res.status(404).json({ message: "Group not found" });
        res.status(200).json(group);
    } catch (err) {
        console.error("DEBUG: Error in getGroupById:", err);
        res.status(500).json({ error: err.message });
    }
};

// 10. Fetch group members with user details
const getGroupMembers = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId)
                                 .populate('members', 'username email'); 

        if (!group) return res.status(404).send({ message: "Group not found" });

        res.json(group.members); 
    } catch (error) {
        res.status(500).send({ message: "Error fetching members" });
    }
};

// 11. Update group metadata (name)
const updateGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const updatedGroup = await Group.findByIdAndUpdate(
            req.params.id, 
            { name }, 
            { new: true }
        );
        
        if (!updatedGroup) {
            return res.status(404).json({ message: "Group not found" });
        }
        
        res.status(200).json(updatedGroup);
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ message: "Failed to update group name" });
    }
};

// 12. Remove a member from the group (Admin only)
const removeMember = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const currentUserId = req.user.id; 

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        if (group.admin.toString() !== currentUserId) {
            return res.status(403).json({ message: "Only the admin can remove members" });
        }

        // Removing the user from the array
        group.members = group.members.filter(m => m.toString() !== memberId);
        await group.save();

        res.status(200).json({ message: "Member removed successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error removing member", error: err.message });
    }
};

module.exports = { 
    createGroup, 
    getAllGroups,
    joinGroup, 
    deleteGroup,
    searchGroups,
    approveMember,
    getGroupRequests,
    getGroupDetails,
    getGroupById,
    getGroupMembers,
    updateGroup,
    removeMember
};