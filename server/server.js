require('dotenv').config();

console.log("DEBUG - Is JWT_SECRET loaded?", process.env.JWT_SECRET);

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Group = require('./models/Group');

const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

// --- Middleware ---
app.use(cors()); // מאפשר ל-React לגשת לשרת מפורטים אחרים
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Import Routes
const postRoutes = require('./routes/post_routes'); 
const userRoutes = require('./routes/user_routes');
const groupRoutes = require('./routes/group_routes'); // ודאי שהנתיב נכון

// Socket.io Setup
const io = new Server(server, {
    cors: { origin: "*" } 
});



// לוגר פשוט - כל פעם שמישהו ינסה להירשם תראי את זה בטרמינל
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} request to ${req.url}`);
    next();
});

// Static Folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 2. Connect Routes
app.use('/api/posts', postRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);

// 3. MongoDB Atlas Connection
const dbURI = process.env.MONGO_URI || 'mongodb+srv://amitush432_db_user:UjHausEntmZ5N8mu@cluster0.95usqkh.mongodb.net/social_network?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI)
  .then(() => {
      console.log('✅ Connected to MongoDB Atlas successfully!');
  })
  .catch(err => {
      console.error('❌ Critical Connection Error:', err.message);
      process.exit(1); 
  });

// מאזין לאירועי חיבור של Mongoose (עוזר בניפוי שגיאות)
mongoose.connection.on('error', err => {
    console.error('Mongoose runtime error:', err);
});

// 4. Real-time Chat Management (Socket.io)
io.on('connection', (socket) => {
  console.log('👤 New User Connected:', socket.id);

  socket.on('join_group', (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group: ${groupId}`);
  });

  // עדכון השליחה עם בדיקת הרשאות
  socket.on('send_message', async (data) => {
    const { groupId, sender, userId } = data; // ודאי שאת שולחת גם userId מה-Frontend

    try {
      // 1. בדיקה האם המשתמש חבר בקבוצה
      const group = await Group.findById(groupId);
      if (!group || !group.members.includes(userId)) {
        console.warn(`Unauthorized attempt to send message by user ${userId}`);
        return; // עוצרים כאן ולא שומרים/משדרים את ההודעה
      }

      // 2. אם הוא חבר, שומרים ומשדרים
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

// 5. Global Error Handling
app.use((err, req, res, next) => {
    console.error("Internal Server Error:", err.stack);
    res.status(500).send({ 
        error: 'Something went wrong!',
        message: err.message 
    });
});

app.get('/api/messages/:groupId', async (req, res) => {
    try {
        const messages = await Message.find({ groupId: req.params.groupId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).send("Error fetching messages");
    }
});

// 6. Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`-----------------------------------------`);
});