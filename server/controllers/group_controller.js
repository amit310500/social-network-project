const Group = require('../models/Group');

// Create a new group
const createGroup = async (req, res) => {
    try {
        // The user who creates the group automatically becomes the admin and a member
        const group = new Group({
            ...req.body,
            admin: req.user.id,
            members: [req.user.id]
        });
        await group.save();
        res.status(201).send(group);
    } catch (error) {
        res.status(400).send({ message: "Error creating group", error });
    }
};

// Join a group (Update members)
const joinGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).send({ message: "Group not found" });

        // Check if the user is already a member
        if (group.members.includes(req.user.id)) {
            return res.status(400).send({ message: "You are already a member of this group" });
        }

        group.members.push(req.user.id);
        await group.save();
        res.status(200).send({ message: "You have successfully joined the group" });
    } catch (error) {
        res.status(500).send({ message: "Server error", error });
    }
};

// Delete a group - Admin only!
const deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).send({ message: "Group not found" });

        // Authorization check: only group admin or system admin can delete
        if (group.admin.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).send({ message: "You do not have permission to delete this group" });
        }

        await Group.findByIdAndDelete(req.params.id);
        res.send({ message: "The group was successfully deleted" });
    } catch (error) {
        res.status(500).send({ message: "Server error", error });
    }
};

module.exports = { createGroup, joinGroup, deleteGroup };