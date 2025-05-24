// models/Guarantor.js
const mongoose = require('mongoose');

const guarantorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guarantorName: {
    type: String,
    required: true
  },
  guarantorImage: {
    type: String, // Store the path to image file
    required: true
  },
  address: {
    type: String,
    required: true
  },
  work: {
    type: String,
    required: true
  },
  verificationCard: {
    type: String, // Store path to verification card image
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Guarantor', guarantorSchema);
