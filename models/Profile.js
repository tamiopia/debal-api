const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  age: {
    type: Number,
    min: 18,
    max: 99
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary', 'prefer-not-to-say']
  },
  bio: {
    type: String,
    maxlength: 500
  },
  photos: [{
    type: String, // URL to image storage
    default: []
  }],
  location: {
    city: String,
    country: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  occupation: String,
  lifestyle: {
    cleanliness: { type: Number, min: 1, max: 5 },
    sleepSchedule: { 
      type: String,
      enum: ['early-bird', 'night-owl', 'flexible'] 
    },
    smoking: Boolean,
    pets: Boolean,
    guests: {
      type: String,
      enum: ['often', 'sometimes', 'rarely', 'never']
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', profileSchema);
