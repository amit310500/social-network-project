require('dotenv').config();

console.log("DEBUG - Is JWT_SECRET loaded?", process.env.JWT_SECRET);

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Models & Routes
const Group = require('./models/Group');
const Message = require('./models/Message');
const postRoutes = require('./routes/post_routes'); 
const userRoutes = require('./routes/user_routes');
const groupRoutes = require('./routes/group_routes'); 

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: { origin: "*" } 
});

// --- Middleware ---
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} request to ${req.url}`);
    next();
});

// Static files for media uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/posts', postRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);

// --- Database Connection ---
const dbURI = process.env.MONGO_URI || 'mongodb+srv://amitush432_db_user:UjHausEntmZ5N8mu@cluster0.95usqkh.mongodb.net/social_network?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI)
  .then(() => {
      console.log('✅ Connected to MongoDB Atlas successfully!');
  })
  .catch(err => {
      console.error('❌ Critical Connection Error:', err.message);
      process.exit(1); 
  });

// Event listener for Mongoose runtime errors
mongoose.connection.on('error', err => {
    console.error('Mongoose runtime error:', err);
});

// --- Real-time Chat (Socket.io) ---
io.on('connection', (socket) => {
  console.log('👤 New User Connected:', socket.id);

  // Join a room based on group ID
  socket.on('join_group', (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group: ${groupId}`);
  });

  // Handle new messages with permission checks
  socket.on('send_message', async (data) => {
    const { groupId, sender, userId } = data; 

    try {
      // 1. Check if the user is actually a member of this group
      const group = await Group.findById(groupId);
      if (!group || !group.members.includes(userId)) {
        console.warn(`Unauthorized attempt to send message by user ${userId}`);
        return; 
      }

      // 2. Save message to DB and broadcast to group room
      const newMessage = new Message(data);
      await newMessage.save();
      io.to(groupId).emit('receive_message', data);
      
    } catch (err) {
      console.error("Error in send_message:", err);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Global Error Handling
app.use((err, req, res, next) => {
    console.error("Internal Server Error:", err.stack);
    res.status(500).send({ 
        error: 'Something went wrong!',
        message: err.message 
    });
});

// API endpoint to fetch chat history for a group
app.get('/api/messages/:groupId', async (req, res) => {
    try {
        const messages = await Message.find({ groupId: req.params.groupId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).send("Error fetching messages");
    }
});

// Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`-----------------------------------------`);
});