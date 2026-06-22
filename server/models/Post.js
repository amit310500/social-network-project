const mongoose = require('mongoose');

/**
 * Post Schema: Defines the structure for posts within the application.
 * Utilizes references to 'User' and 'Group' for relational data integrity
 * and includes timestamps for statistical analysis.
 */

const postSchema = new mongoose.Schema({
    // Reference to the User who created the post
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    group: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true 
    },
    content: { 
        type: String, 
        required: false,
        trim: true 
    },
    isPrivate: { 
        type: Boolean, 
        default: false 
    },
    mediaUrl: { 
        type: String, 
        default: "" 
    },
    drawing: { 
        type: String,
     },

}, { 
    // Automatically manage createdAt and updatedAt fields
    timestamps: true 
});

module.exports = mongoose.model('Post', postSchema);