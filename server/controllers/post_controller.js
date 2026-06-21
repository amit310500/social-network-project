const Post = require('../models/Post');
const Group = require('../models/Group'); // נדרש לבדיקת הרשאות

const createPost = async (req, res) => {
    console.log("Data received in server:", req.body);
    try {

        const { content, groupId, mediaUrl,drawing, isPrivate } = req.body;
        
        if (!content && !drawing && !mediaUrl) {
            return res.status(400).json({ message: "Content, drawing or media is required" });
        }
        if (!groupId) return res.status(400).json({ message: "Group ID is required" });

        // בדיקה: האם המשתמש חבר בקבוצה או מנהל?
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        const isMember = group.members.includes(req.user.id);
        const isAdmin = group.admin.toString() === req.user.id;

        if (!isMember && !isAdmin) {
            return res.status(403).json({ message: "You must be a member to post in this group" });
        }

        const postData = { 
            sender: req.user.id, 
            group: groupId, 
            content: content || "", 
            mediaUrl: mediaUrl || "",
            drawing: drawing || "",
            isPrivate: isPrivate || false 
        };

        const newPost = await Post.create(postData);
        const populatedPost = await Post.findById(newPost._id)
            .populate('sender', 'username')
            .populate('group', 'name');
            
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
        let query = {};

        // 1. סינון חובה לפי קבוצה
        if (groupId) query.group = groupId; 
        
        // 2. סינון לפי תאריך ספציפי (טיפול בטווח של יום שלם)
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0); // תחילת היום (00:00:00)
            
            const end = new Date(startDate);
            end.setHours(23, 59, 59, 999); // סוף היום (23:59:59)
            
            query.createdAt = { 
                $gte: start, 
                $lte: end 
            };
        }

        // 3. סינון לפי טקסט
        // אם המשתמש כתב טקסט, נחפש אותו ב-content. 
        // בגלל ששאר הפילטרים (קבוצה ותאריך) נמצאים ב-query, 
        // פוסטים ללא טקסט שנוצרו בתאריך הזה עדיין יופיעו בתוצאות.
        if (text) {
            query.content = { $regex: text, $options: 'i' };
        }

        // 4. שליפה מה-DB
        let posts = await Post.find(query)
            .populate('sender', 'username')
            .sort({ createdAt: -1 });
        
        // 5. סינון שם משתמש בצד השרת (מכיוון שזה Populate)
        if (username) {
            posts = posts.filter(post => 
                post.sender && post.sender.username.toLowerCase().includes(username.toLowerCase())
            );
        }
        
        res.status(200).json(posts);
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ message: "Search failed", error: err.message });
    }
};

const getPersonalFeed = async (req, res) => {
    try {
        console.log("Looking for posts for user ID:", req.user.id);
        
        // מציאת הפוסטים של המשתמש
        const myPosts = await Post.find({ sender: req.user.id })
                                  .populate('sender', 'username')
                                  .populate('group', 'name')
                                  .sort({ createdAt: -1 }); // הוספתי מיון לתוצאה טובה יותר
        
        console.log("Found posts count:", myPosts.length);
        
        res.status(200).json(myPosts); 
    } catch (err) {
        console.error("Error in getPersonalFeed:", err);
        res.status(500).json({ message: "Error fetching feed", error: err.message });
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
        // req.query.groupId מגיע מה-URL: /api/posts?groupId=...
        const group = await Group.findById(req.query.groupId); 
        if (!group) return res.status(404).json({ message: "Group not found" });

        // ... בדיקות הרשאות ...

        // כאן השתמשת נכון בשם השדה "group" שראינו ב-MongoDB
        const posts = await Post.find({ group: req.query.groupId }).populate('sender', 'username');
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
};
const uploadVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        // נניח שאת שומרת את הקובץ וחוזרת עם ה-URL שלו
        const videoUrl = `/uploads/${req.file.filename}`; 
        res.status(200).json({ videoUrl: videoUrl });
    } catch (err) {
        res.status(500).json({ message: "Upload failed", error: err.message });
    }
};

const getStats = async (req, res) => {
    try {
        // גרף 1: פוסטים לפי חודש
        const postsByMonth = await Post.aggregate([
            { 
                $group: { 
                    _id: { $month: "$createdAt" }, 
                    count: { $sum: 1 } 
                } 
            },
            { 
                $project: { 
                    month: {
                        $arrayElemAt: [
                            ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                            "$_id"
                        ]
                    }, 
                    count: 1, 
                    _id: 0 
                } 
            },
            { $sort: { month: 1 } }
        ]);
        
        // גרף 2: פוסטים לפי קבוצה
        // שים לב: השתמשתי ב-"group" במקום ב-"groupId" לפי איך שכתבת ב-createPost
        const postsByGroup = await Post.aggregate([
            { $group: { _id: "$group", count: { $sum: 1 } } }, 
            { 
                $lookup: { 
                    from: "groups", // שם האוסף ב-DB (בדרך כלל באות קטנה וברבים)
                    localField: "_id", 
                    foreignField: "_id", 
                    as: "groupInfo" 
                } 
            },
            { 
                $project: { 
                    name: { $ifNull: [{ $arrayElemAt: ["$groupInfo.name", 0] }, "Unknown"] }, 
                    count: 1,
                    _id: 0 
                } 
            }
        ]);

        res.json({ postsByMonth, postsByGroup });
    } catch (err) { 
        console.error("Stats Error:", err);
        res.status(500).json({ error: err.message }); 
    }
};


module.exports = {
    getAllPosts, // <--- זה היה חסר!
    createPost,
    deletePost,
    updatePost,
    searchPosts,
    getPersonalFeed,
    getUserPosts,
    getStats,
    uploadVideo
};