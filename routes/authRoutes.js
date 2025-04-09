const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const passport = require('passport');
require('dotenv').config();
const jwt = require("jsonwebtoken");

// Public routes
router.post("/register", register);
router.post("/login", login);

// GitHub Auth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    const token = generateToken(req.user._id);
    res.redirect(`http://localhost:3000/auth-success?token=${token}`);
  }
);

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    const token = generateToken(req.user._id);
    res.redirect(`http://localhost:3000/auth-success?token=${token}`);
  }
);

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  };

// Protected route (requires JWT)
router.get("/me", protect, getMe);

module.exports = router;