require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken'); // Add this for JWT verification
const connectDB = require('./config/db');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger-config');
const bodyParser = require('body-parser');

// Route imports
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const profileRoutes = require('./routes/profileRoutes');
const matchRoutes = require('./routes/matchRoutes');
const chatRoutes = require('./routes/chatRoutes');
const houseProviderRoutes = require('./routes/houseProviderRoutes');
const houseListingRoutes = require('./routes/houseListingRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const houseRuleRoutes = require('./routes/houseRuleRoutes');

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);

// Enhanced Socket.io setup
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  path: '/socket.io', // Explicit socket.io path
  transports: ['websocket', 'polling'], // Preferred transports
  pingInterval: 10000, // How often to ping/pong
  pingTimeout: 5000, // Time before closing the connection
});

// Passport config
require('./config/passport');

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// Database connection
connectDB();

// Socket.io Authentication Middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      
      // Attach user information to the socket
      socket.user = {
        id: decoded.id,
        username: decoded.username
      };
      
      next();
    });
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id} (User: ${socket.user?.id})`);

  // Join user to their personal room
  socket.join(`user_${socket.user.id}`);

  // Handle joining conversation rooms
  socket.on('joinConversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`User ${socket.user.id} joined conversation ${conversationId}`);
  });

  // Handle leaving conversation rooms
  socket.on('leaveConversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`User ${socket.user.id} left conversation ${conversationId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  // Error handling
  socket.on('error', (err) => {
    console.error(`Socket error (${socket.id}):`, err);
  });
});

// Make io accessible in routes
app.set('io', io);

// Routes
app.get('/', (req, res) => {
  res.send('🚀 Backend is in hurry to get his debal ❤️!');
});

app.use("/api/auth", authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/list', houseListingRoutes);
app.use('/api/providers', houseProviderRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/house-rules', houseRuleRoutes);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger UI
app.use('/api-docs', 
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`Socket.io listening on ws://localhost:${PORT}/socket.io`);
});