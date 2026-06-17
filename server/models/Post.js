const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    // קישור למודל המשתמש - קריטי לניהול הרשאות (מי יכול למחוק/לערוך)
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    group: { // <-- השדה החדש שמקשר לקבוצה
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true 
    },
    content: { 
        type: String, 
<<<<<<< HEAD
        required: false,
=======
        required: true,
>>>>>>> ee1cbc61ba8baba94a400ca5a59e7c5ef1667202
        trim: true 
    },
    isPrivate: { 
        type: Boolean, 
        default: false 
    },
    // שדה למדיה (תמונה/וידאו) - דרישה טכנית בפרויקט
    mediaUrl: { 
        type: String, 
        default: "" 
    },
<<<<<<< HEAD
    drawing: { 
        type: String,
     },
=======
>>>>>>> ee1cbc61ba8baba94a400ca5a59e7c5ef1667202
    // שדות שיעזרו לך להפיק גרפים ב-D3.js בהמשך
    likes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }]
}, { 
    // מוסיף אוטומטית createdAt ו-updatedAt בצורה תקנית
    timestamps: true 
});

module.exports = mongoose.model('Post', postSchema);