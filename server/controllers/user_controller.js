const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register (Create User)
const register = async (req, res) => {
    try {
        // הוספנו את email לחילוץ מהבקשה
        const { username, email, password } = req.body;

        // בדיקה אם שם המשתמש או האימייל כבר קיימים
        const userExists = await User.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (userExists) {
            return res.status(400).send({ 
                message: userExists.username === username ? "Username already taken" : "Email already registered" 
            });
        }

        // יצירת משתמש חדש
        // בזכות ה-pre('save') במודל, הסיסמה תוצפן אוטומטית לפני השמירה
        const newUser = new User({ 
            username, 
            email, 
            password 
        });

        await newUser.save();
        res.status(201).send({ message: "User created successfully" });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(400).send({ 
            message: "Registration failed", 
            error: error.message 
        });
    }
};

// Login (Authentication)
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // מציאת המשתמש לפי שם
        const user = await User.findOne({ username });
        
        // השוואת הסיסמה שהוזנה מול הסיסמה המוצפנת ב-DB
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send({ message: "Invalid username or password" });
        }
        
        // יצירת Token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.send({ 
            token, 
            _id: user._id,   // הוספת המזהה הייחודי מה-DB
            username: user.username, 
            role: user.role 
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send({ message: "Error during login process", error: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        // req.user.id מגיע מה-Middleware
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Update User (עדכון פרטי משתמש - שם משתמש או אימייל)
const updateUser = async (req, res) => {
    try {
        const { username, email } = req.body;
        
        // עדכון המשתמש לפי ה-ID שהגיע מהפרמטרים של ה-URL
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            { username, email }, 
            { new: true, runValidators: true }
        ).select('-password'); // לא להחזיר את הסיסמה בטעות

        if (!updatedUser) {
            return res.status(404).send({ message: "User not found" });
        }

        res.send(updatedUser);
    } catch (error) {
        console.error("Update User Error:", error);
        res.status(400).send({ message: "Update failed", error: error.message });
    }
};

// Delete User (מחיקת משתמש)
const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        
        if (!deletedUser) {
            return res.status(404).send({ message: "User not found" });
        }

        res.send({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).send({ message: "Delete failed", error: error.message });
    }
};

module.exports = { 
    register, 
    login, 
    getMe,
    updateUser,
    deleteUser
};