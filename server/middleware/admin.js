const Group = require('../models/Group');

/**
 * Middleware: Checks if the logged-in user is the administrator of the target group.
 * If the user is the admin, the request proceeds. Otherwise, access is denied.
 */
const isGroupAdmin = async (req, res, next) => {
    try {
        // Attempt to retrieve the group ID from either request parameters
        const idToCheck = req.params.id || req.params.groupId;
        const group = await Group.findById(idToCheck);
        
        if (!group) return res.status(404).json({ message: "Group not found" });
        
        // Authorization check: Compare current user ID with the group's admin ID
        if (group.admin.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access Denied: Only group admin can perform this" });
        }
        
        next(); 
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = isGroupAdmin;