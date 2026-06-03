const Post = require('../models/Post');

const createPost = async (req, res) => {
    try {
        const { content, groupId, group, mediaUrl } = req.body;
        const targetGroupId = groupId || group; 
        if (!content) return res.status(400).json({ message: "Content is required" });

        const postData = { sender: req.user.id, content, mediaUrl: mediaUrl || "" };
        if (targetGroupId) {
            postData.group = targetGroupId;
            postData.groupId = targetGroupId; 
        }

        const newPost = await Post.create(postData);
        const populatedPost = await Post.findById(newPost._id).populate('sender', 'username');
        res.status(201).json(populatedPost);
    } catch (err) {
        res.status(400).json({ message: "Failed to create post", error: err.message });
    }
};



const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // --- כאן בדיוק תוסיפי את הבדיקה ---
        console.log("Post sender (from DB):", post.sender);
        console.log("Logged in User ID (from Token):", req.user.id);
        // ---------------------------------

        // הבדיקה הקריטית:
        if (post.sender.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized: You can only delete your own posts" });
        }

        await post.deleteOne();
        res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
};

const updatePost = async (req, res) => {
    try {
        console.log("--- Start Update ---");
        console.log("Post ID from URL:", req.params.id);
        
        const post = await Post.findById(req.params.id);
        if (!post) {
            console.log("Post not found in DB");
            return res.status(404).json({ message: "Post not found" });
        }

        console.log("Post sender:", post.sender.toString());
        console.log("User from Token:", req.user?.id);

        if (post.sender.toString() !== req.user.id) {
            console.log("Unauthorized: Mismatch!");
            return res.status(403).json({ message: "Unauthorized" });
        }

        post.content = req.body.content;
        await post.save();
        
        const updated = await Post.findById(post._id).populate('sender', 'username');
        res.status(200).json(updated);
    } catch (err) {
        console.log("CRITICAL ERROR:", err.message);
        res.status(500).json({ message: "Update failed", error: err.message });
    }
};

const searchPosts = async (req, res) => {
    try {
        const { text, username, startDate, groupId } = req.query;
        let query = groupId ? { group: groupId } : {};
        
        // חיפוש טקסט
        if (text) query.content = { $regex: text, $options: 'i' }; 
        // חיפוש תאריך
        if (startDate) query.createdAt = { $gte: new Date(startDate) };

        // שליפת פוסטים + פופולציה למציאת שם המשתמש
        let posts = await Post.find(query).populate('sender', 'username').sort({ createdAt: -1 });
        
        // סינון לפי שם משתמש בצד השרת (כפי שעשית)
        if (username) {
            posts = posts.filter(post => 
                post.sender && post.sender.username.toLowerCase().includes(username.toLowerCase())
            );
        }
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: "Search failed", error: err.message });
    }
};

const getPersonalFeed = async (req, res) => {
    try {
        // מציאת כל הפוסטים של המשתמש המחובר
        const myPosts = await Post.find({ sender: req.user.id }).populate('sender', 'username').populate('group', 'name');;
        
        // מציאת פוסטים של קבוצות שהמשתמש חבר בהן (דורש מערך groups ב-User)
        // אם אין לך מערך groups ב-User, אפשר פשוט להחזיר את כל הפוסטים של הקבוצות שהמשתמש חבר בהן
        res.status(200).json(myPosts); 
    } catch (err) {
        res.status(500).json({ message: "Error fetching feed" });
    }
};

const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ sender: req.params.userId }).populate('sender', 'username').populate('group', 'name');;
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
};

const getAllPosts = async (req, res) => {
    try {
        // מביא פוסטים לפי הקבוצה שנשלחה ב-Query
        const posts = await Post.find({ group: req.query.groupId }).populate('sender', 'username');
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: "Error fetching posts" });
    }
};


module.exports = {
    getAllPosts, // <--- זה היה חסר!
    createPost,
    deletePost,
    updatePost,
    searchPosts,
    getPersonalFeed,
    getUserPosts
};