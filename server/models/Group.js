const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // מנהל הקבוצה
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // רשימת חברים
    isPrivate: { type: Boolean, default: false }, // לצורך הרשאות צפייה
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', groupSchema);