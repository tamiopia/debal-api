const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      unique: true
    },
    // Lifestyle Preferences
    lifestyle: {
      cleanliness: { type: Number, min: 1, max: 5 },
      sleepSchedule: { type: String, enum: ['early', 'late', 'flexible'] },
      smoking: { type: Boolean, default: false },
      pets: { type: Boolean, default: false }
    },
    // Location Preferences
    location: {
      city: String,
      maxDistance: { type: Number, default: 10 } // in miles
    },
    // Budget Preferences
    budget: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' }
    },
    // Matching Filters
    preferredGender: { type: String, enum: ['male', 'female', 'any'] },
    ageRange: {
      min: { type: Number, min: 18 },
      max: { type: Number, max: 99 }
    }
  }, { timestamps: true });