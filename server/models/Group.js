const mongoose = require('mongoose');

/**
 * Group Schema: Defines the structure for group documents in MongoDB.
 * Includes references to the 'User' model for admins, members, and join requests.
 */

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPrivate: { type: Boolean, default: false }, // Privacy flag to determine if users need approval to join
    createdAt: { type: Date, default: Date.now },
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Group', groupSchema);