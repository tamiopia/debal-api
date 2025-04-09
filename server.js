require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require('./routes/profileRoutes');
// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON body

// Connect to MongoDB
connectDB();

// Test Route
app.get('/', (req, res) => {
  res.send('🚀 Backend is in hurry to get his debal ❤️!');
});

app.use("/api/auth", authRoutes);

app.use('/api/profiles', profileRoutes);

// Define PORT
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(` 🚀 debal  `+`❤️`+`      waiting for you on http://localhost:${PORT}`);
});