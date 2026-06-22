const Post = require('../models/Post');
const Group = require('../models/Group'); 

// Creates a new post after verifying membership in the specified group
const createPost = async (req, res) => {
    console.log("Data received in server:", req.body);
    try {

        const { content, groupId, mediaUrl,drawing, isPrivate } = req.body;
        
        if (!content && !drawing && !mediaUrl) {
            return res.status(400).json({ message: "Content, drawing or media is required" });
        }
        if (!groupId) return res.status(400).json({ message: "Group ID is required" });

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

// Deletes a post if the user is the owner or the group administrator
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Retrieving the group the post belongs to to check who the admin is
        const group = await Group.findById(post.group); 
        
        // Setting test variables
        const isOwner = post.sender.toString() === req.user.id;
        const isAdmin = group && group.admin.toString() === req.user.id; 

        // 3. Delete confirmation if he is the owner or manager
        if (isOwner || isAdmin) {
            await post.deleteOne();
            res.status(200).json({ message: "Deleted successfully" });
        } else {
            return res.status(403).json({ message: "Unauthorized: You don't have permission to delete this post" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error deleting post", error: err.message });
    }
};

// Updates existing post content (only the original sender can update)
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

// Searches posts based on text, username, and date filters
const searchPosts = async (req, res) => {
    try {
        const { text, username, startDate, groupId } = req.query;
        let query = {};

        // filtering by group
        if (groupId) query.group = groupId; 
        
        // 2. Filter by specific date (treatment within a whole day)
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0); 
            
            const end = new Date(startDate);
            end.setHours(23, 59, 59, 999); 
            
            query.createdAt = { 
                $gte: start, 
                $lte: end 
            };
        }

        // Filter by text
        // If the user wrote text, we will search for it in the content.
        // Because the other filters (group and date) are in the query,
        // posts without text created on that date will still appear in the results.
        if (text) {
            query.content = { $regex: text, $options: 'i' };
        }

        // Retrieve from the DB
        let posts = await Post.find(query)
            .populate('sender', 'username')
            .sort({ createdAt: -1 });
        
        // 5. Server-side username filtering (because it's Populate)
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

// Fetches the user's personal feed
const getPersonalFeed = async (req, res) => {
    try {
        console.log("Looking for posts for user ID:", req.user.id);
        
        const myPosts = await Post.find({ sender: req.user.id })
                                  .populate('sender', 'username')
                                  .populate('group', 'name')
                                  .sort({ createdAt: -1 }); 
        
        console.log("Found posts count:", myPosts.length);
        
        res.status(200).json(myPosts); 
    } catch (err) {
        console.error("Error in getPersonalFeed:", err);
        res.status(500).json({ message: "Error fetching feed", error: err.message });
    }
};

// Fetches all posts from a specific user
const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ sender: req.params.userId }).populate('sender', 'username').populate('group', 'name');;
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
};

// Fetches all posts for a specific group
const getAllPosts = async (req, res) => {
    try {
        const group = await Group.findById(req.query.groupId); 
        if (!group) return res.status(404).json({ message: "Group not found" });

        const posts = await Post.find({ group: req.query.groupId }).populate('sender', 'username');
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
};

// Handles media file uploads and returns the file URL
const uploadMedia = async (req, res) => {
    if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const mediaUrl = `http://localhost:5001/uploads/${req.file.filename}`;
  res.status(200).json({ mediaUrl });
};

// Generates aggregated statistics for posts by month and by group
const getStats = async (req, res) => {
    try {
        // Graph 1: Posts by month
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
        
        // Graph 2: Posts by group
        const postsByGroup = await Post.aggregate([
            { $group: { _id: "$group", count: { $sum: 1 } } }, 
            { 
                $lookup: { 
                    from: "groups", 
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
    getAllPosts, 
    createPost,
    deletePost,
    updatePost,
    searchPosts,
    getPersonalFeed,
    getUserPosts,
    getStats,
    uploadMedia
};