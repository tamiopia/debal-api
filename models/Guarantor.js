// models/Guarantor.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const GuarantorSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the user being guaranteed
      required: true,
    },
    guarantor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Guarantor is also a user, referencing another user
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String, // URL or path to the image
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    work: {
      type: String,
      required: true,
    },
    verificationCard: {
      type: String, // URL or path to the ID/verification card image
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true, // Assuming phone numbers are unique
    },
    liability: {
      type: String,
      required: true, // What the guarantor is liable for
    },
    agreementStartDate: {
      type: Date,
      required: true,
    },
    agreementEndDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'terminated'],
      default: 'active',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending', // Initially, the status is pending until verified by admin
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Guarantor = mongoose.model('Guarantor', GuarantorSchema);

module.exports = Guarantor;
