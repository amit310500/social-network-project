const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema: Defines the user structure.
 * Includes security measures like password hashing and role-based access.
 */

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true, 
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },
    groups: [{  // Reference to groups the user belongs to
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Group' 
    }]
}, { timestamps: true }); 

// Hash the password before saving to the database
userSchema.pre('save', async function() {
    // Skip hashing if the password field was not modified
    if (!this.isModified('password')) {
        return; 
    }

    try {
        // Generate salt and hash the password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error; 
    }
});

module.exports = mongoose.model('User', userSchema);