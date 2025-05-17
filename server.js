require('dotenv').config();
const express = require('express');
const http = require('http'); // Required for Socket.io
const socketio = require('socket.io');
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
const chatRoutes = require('./routes/chatRoutes'); // New chat routes
const houseProviderRoutes = require('./routes/houseProviderRoutes'); // New chat routes
const houseListingRoutes = require('./routes/houseListingRoutes'); // New chat routes
const verificationRoutes = require('./routes/verificationRoutes');
const houseRuleRoutes = require('./routes/houseRuleRoutes'); // New chat routes

// New chat routes

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app); // Express now runs on HTTP server

// Socket.io setup
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Passport config


require('./config/passport');

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// Database connection
connectDB();

// Routes
app.get('/', (req, res) => {
  res.send('🚀 Backend is in hurry to get his debal ❤️!');
});

app.use("/api/auth", authRoutes);
app.use('/api/admin',adminRoutes)
app.use('/api/profiles', profileRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes); // New chat endpoint
app.use('/api/list', houseListingRoutes); 
app.use('/api/providers', houseProviderRoutes); 
app.use('/api/verification',verificationRoutes ); 
app.use('/api/house-rules', houseRuleRoutes); // new house rule route

// Socket.io connection handler
require('./sockets/chatSocket')(io); // Real-time chat logic
// Add this after Socket.io initialization
app.set('io', io); // Make io accessible in routes


// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger UI
app.use('/api-docs', 
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);
// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});