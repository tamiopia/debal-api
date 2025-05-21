const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One verification request per user
  },
  fullName: {
    type: String,
    required: true
  },
  idType: {
    type: String,
    enum: ['national-id', 'passport', 'driver-license'],
    required: true
  },
  idNumber: {
    type: String,
    required: true
  },
  frontIdImage: {
    type: String,
    required: true
  },
  backIdImage: {
    type: String,
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
