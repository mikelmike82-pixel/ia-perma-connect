const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const prisma = require('./src/utils/prisma');

const app = express();
const server = http.createServer(app);

// Set up Socket.IO on top of our HTTP server
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Make io accessible inside our route controllers via req.app.get('io')
app.set('io', io);

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to IA PERMA CONNECT API' });
});

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/conversations', require('./src/routes/conversationRoutes'));
app.use('/api/announcements', require('./src/routes/announcementRoutes'));
app.use('/api/stats', require('./src/routes/statsRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));

// Keep track of which userId is connected to which socket
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Frontend tells us which user this socket belongs to
  socket.on('register', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} registered on socket ${socket.id}`);

    // Tell everyone else this user is now online
    socket.broadcast.emit('userOnline', userId);
  });

  // Let a newly connected client ask "who's currently online?"
  socket.on('getOnlineUsers', () => {
    socket.emit('onlineUsersList', Array.from(onlineUsers.keys()));
  });

  // Join a conversation "room" so we can send messages to everyone in it
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('leaveConversation', (conversationId) => {
    socket.leave(conversationId);
  });

  // Typing indicator
  socket.on('typing', ({ conversationId, userId, userName }) => {
    socket.to(conversationId).emit('userTyping', { conversationId, userId, userName });
  });

  socket.on('stopTyping', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('userStoppedTyping', { conversationId, userId });
  });

socket.on('disconnect', async () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);

      // Tell everyone else this user went offline
      socket.broadcast.emit('userOffline', socket.userId);

      // Update lastSeen in the database
      try {
        await prisma.user.update({
          where: { id: socket.userId },
          data: { isOnline: false, lastSeen: new Date() },
        });
      } catch (err) {
        console.error('Failed to update lastSeen:', err.message);
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});