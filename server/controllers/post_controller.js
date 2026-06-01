const Post = require('../models/Post');

// 1. יצירת פוסט חדש (Create) - מעולה!
const createPost = async (req, res) => {
    try {
        const { content, groupId, group, mediaUrl } = req.body;
        const targetGroupId = groupId || group; 

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        // יצירת אובייקט הנתונים הבסיסי
        const postData = {
            sender: req.user.id, 
            content: content,
            mediaUrl: mediaUrl || ""
        };

        // הזרקה כפולה - מבטיח שזה יעבוד לא משנה איך השדה נקרא ב-Model
        if (targetGroupId) {
            postData.group = targetGroupId;
            postData.groupId = targetGroupId; 
        }

        const newPost = new Post(postData);
        const savedPost = await newPost.save();
        
        // שליפה מחדש עם ה-Username של השולח (Populate)
        const populatedPost = await Post.findById(savedPost._id).populate('sender', 'username');
        
        res.status(201).json(populatedPost);
    } catch (err) {
        console.error("Create Post Error:", err);
        res.status(400).json({ message: "Failed to create post", error: err.message });
    }
};

// 2. משיכת כל הפוסטים (List) - **מתוקן לסינון קבוצות**
const getAllPosts = async (req, res) => {
    try {
        // מקבל את ה-groupId ששולח ה-React ב-Query Parameters (למשל: ?groupId=123)
        const { groupId } = req.query;
        let query = {};

        // אם נשלח מזהה קבוצה, נשלוף רק פוסטים ששייכים אליה!
        if (groupId) {
            query.group = groupId;
        }

        const posts = await Post.find(query)
            .populate('sender', 'username')
            .sort({ createdAt: -1 });
            
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: "Error fetching posts", error: err.message });
    }
};

// 3. מחיקת פוסט (Delete) - מעולה!
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

// 4. חיפוש פוסטים (Search) - **מתוקן לסינון קבוצות בתוך החיפוש**
const searchPosts = async (req, res) => {
    try {
        const { text, username, startDate, groupId } = req.query;
        let query = {};

        // חיוב סינון לפי הקבוצה הנוכחית כדי שתוצאות החיפוש לא יתערבבו מקבוצות אחרות!
        if (groupId) {
            query.group = groupId;
        }

        // 1. סינון לפי טקסט בתוכן הפוסט
        if (text) {
            query.content = { $regex: text, $options: 'i' }; 
        }
        
        // 2. סינון לפי תאריך יצירה (מאז תאריך מסוים)
        if (startDate) {
            query.createdAt = { $gte: new Date(startDate) };
        }

        // שליפת הפוסטים המסוננים עם קבוצה ופרמטרים
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