require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// 1. Import Routes
const postRoutes = require('./routes/post_routes'); 
const userRoutes = require('./routes/user_routes');
const groupRoutes = require('./routes/group_routes');

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
    cors: { origin: "*" } 
});

// --- Middleware ---
app.use(cors()); // מאפשר ל-React לגשת לשרת מפורטים אחרים
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  
  socket.on('send_message', (data) => {
    io.emit('receive_message', data); 
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

// 6. Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`-----------------------------------------`);
});