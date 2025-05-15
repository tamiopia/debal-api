const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One verification request per user
  },
  documentType: {
    type: String,
    enum: ['national-id', 'passport', 'driver-license'],
    required: true
  },
  documentImage: {
    type: String, // URL or file path
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin/staff
  }
});

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);
