const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register a new user and ensure username/email uniqueness
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if the user already exists
        const userExists = await User.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (userExists) {
            return res.status(400).send({ 
                message: userExists.username === username ? "Username already taken" : "Email already registered" 
            });
        }

       // Create new user (Password hashing is handled by the model's pre-save hook)
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

// Login user and generate a JWT for authentication
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ username });
        
        // Verify credentials
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send({ message: "Invalid username or password" });
        }
        
        // Generate Token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.send({ 
            token, 
            _id: user._id,   
            username: user.username, 
            role: user.role 
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send({ message: "Error during login process", error: error.message });
    }
};

// Fetch current user details excluding the password
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Update user profile information (username and email)
const updateUser = async (req, res) => {
    try {
        const { username, email } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            { username, email }, 
            { new: true, runValidators: true }
        ).select('-password'); // Don't accidentally return the password

        if (!updatedUser) {
            return res.status(404).send({ message: "User not found" });
        }

        res.send(updatedUser);
    } catch (error) {
        console.error("Update User Error:", error);
        res.status(400).send({ message: "Update failed", error: error.message });
    }
};

// Delete a user account from the database
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

// Search users based on various filters (username, email, or registration date)
const searchUsers = async (req, res) => {
    
    try {
        const { username, email, startDate } = req.query;
        let query = {};

        if (username) query.username = { $regex: username, $options: 'i' };
        if (email) query.email = { $regex: email, $options: 'i' };
        if (startDate) {
            query.createdAt = { $gte: new Date(startDate) };
        }

        // Retrieve the users (without the password)
        const users = await User.find(query).select('-password');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Search failed", error: err.message });
    }
};

module.exports = { 
    register, 
    login, 
    getMe,
    updateUser,
    deleteUser,
    searchUsers
};