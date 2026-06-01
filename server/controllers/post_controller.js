const Post = require('../models/Post');

/// 1. יצירת פוסט חדש (Create) - מתוקן ומאובטח
const createPost = async (req, res) => {
    try {
        const { content, groupId, mediaUrl } = req.body;

        // וידוא שהתוכן הגיע (הסרנו את חובת ה-groupId כדי שהפיד הכללי יעבוד)
        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        const newPost = new Post({
            sender: req.user.id, // משתמש ב-ID המאובטח שמגיע מה-auth middleware של השרת
            content: content,
            mediaUrl: mediaUrl || ""
        });

        // אם ה-React שלח groupId (כלומר הפוסט נכתב בתוך קבוצה), נוסיף אותו לפוסט
        if (groupId) {
            newPost.group = groupId;
        }

        const savedPost = await newPost.save();
        
        // החזרת הפוסט עם שם המשתמש (בשביל להציג מיד בפיד)
        const populatedPost = await Post.findById(savedPost._id).populate('sender', 'username');
        
        res.status(201).json(populatedPost);
    } catch (err) {
        console.error("Create Post Error:", err);
        res.status(400).json({ message: "Failed to create post", error: err.message });
    }
};

// 2. משיכת כל הפוסטים (List)
const getAllPosts = async (req, res) => {
    try {
        // משיכת הפוסטים, הוספת פרטי המשתמש ומיון לפי תאריך
        const posts = await Post.find()
            .populate('sender', 'username')
            .sort({ createdAt: -1 });
            
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: "Error fetching posts", error: err.message });
    }
};

// 3. מחיקת פוסט (Delete) - הוספתי לך את זה לציון גבוה יותר
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPost = await Post.findByIdAndDelete(id);

        if (!deletedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting post", error: err.message });
    }
};

const searchPosts = async (req, res) => {
    try {
        const { text, username, startDate } = req.query;
        let query = {};

        // 1. סינון לפי טקסט בתוכן הפוסט
        if (text) {
            query.content = { $regex: text, $options: 'i' }; 
        }
        
        // 2. סינון לפי תאריך יצירה (מאז תאריך מסוים)
        if (startDate) {
            query.createdAt = { $gte: new Date(startDate) };
        }

        // שליפת הפוסטים עם populate של השולח
        let posts = await Post.find(query).populate('sender', 'username').sort({ createdAt: -1 });

        // 3. סינון לפי שם המשתמש שכתב את הפוסט
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

module.exports = {
    createPost,
    getAllPosts,
    deletePost,
    searchPosts
};