const jwt = require("jsonwebtoken");
require('dotenv').config();
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization || req.headers.Authorization;

if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
}
    token = authHeader; // Check for token in cookie
console.log("Token:", token);

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded);
    req.user = await User.findById(decoded.id).select("-password");
    console.log("User:", req.user);
    next();
  } catch (err) {
    res.status(401).json({ error: "Not authorized, token failed" });
  }
};

// Admin middleware (optional)
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Not authorized as admin" });
  }
};