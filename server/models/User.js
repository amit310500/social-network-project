const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true // מומלץ: מנקה רווחים מיותרים
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true, // שומר את המייל תמיד באותיות קטנות למניעת כפילויות
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
    groups: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Group' 
    }]
}, { timestamps: true }); // מוסיף אוטומטית שדות createdAt ו-updatedAt

// --- התיקון הקריטי כאן ---
// הצפנת הסיסמה לפני השמירה ב-DB
userSchema.pre('save', async function() {
    // אם הסיסמה לא שונתה (למשל בעדכון פרופיל), אל תצפין אותה שוב
    if (!this.isModified('password')) {
        return; 
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        // אין צורך ב-next() כי זו פונקציית async
    } catch (error) {
        throw error; // זורקים את השגיאה ו-Mongoose יטפל בה
    }
});

module.exports = mongoose.model('User', userSchema);