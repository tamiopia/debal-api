const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String,
    // Password is required only for local strategy (not for OAuth)
    required: function() { return !this.googleId && !this.githubId; }
  },
  googleId: String,
  githubId: String,
  avatar: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isOnline: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);