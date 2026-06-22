const mongoose = require('mongoose');

/**
 * Message Schema: Defines the structure for chat messages within groups.
 * This model stores the sender's username, the message content, and the group context.
 */

const messageSchema = new mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, required: true },
    sender: { type: String, required: true }, // The name of the user who sent the message
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);