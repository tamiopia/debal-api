const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  // Personal Information
  age: {
    type: Number,
    min: 18, // Must be at least 18
    max: 99 // Max age
  },
  gender: {
    type: String,
    enum: ['male', 'female'], // Gender options
    required: true
  },
  occupation: {
    type: String,
    maxlength: 100 // Max length for occupation description
  },
  religion: {
    type: String,
    enum: ['christianity', 'islam', 'hinduism', 'judaism', 'other', 'none'], // Popular religion types
    default: 'none'
  },

  // Lifestyle
  personality_type: {
    type: String,
    enum: ['introvert', 'extrovert', 'ambivert'], // User personality type
  },
  daily_routine: {
    type: String,
    maxlength: 500 // Max length for the daily routine
  },
  sleep_pattern: {
    type: String,
    enum: ['early-bird', 'night-owl', 'flexible'],
    required: true
  },

  // Neighborhood Preferences
  preferred_location_type: {
    type: String,
    enum: ['urban', 'suburban', 'rural'], // Living preference for location
    required: true
  },
  commute_tolerance_minutes: {
    type: Number,
    min: 0,
    max: 120 // Max commute tolerance (in minutes)
  },

  // Hobbies (Multi-select)
  hobbies: [{
    type: String,
    enum: ['reading', 'sports', 'travelling', 'music', 'movies', 'gaming', 'cooking', 'art','board games'],
    required: true
  }],

  // Financial
  income_level: {
    type: String,
    maxlength: 50, // Allowing a range or description
    required: true
  },
  budget_range: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },

  // Shared Living Preferences
  cleanliness_level: {
    type: String,
    enum: ['very-clean', 'clean', 'average', 'messy'],
    required: true
  },
  chore_sharing_preference: {
    type: String,
    enum: ['share', 'separate'],
    required: true
  },
  noise_tolerance: {
    type: String,
    enum: ['quiet', 'average', 'noisy'],
    required: true
  },
  guest_frequency: {
    type: String,
    enum: ['never', 'rarely', 'sometimes', 'often'],
    required: true
  },
  party_habits: {
    type: String,
    enum: ['never', 'rarely', 'sometimes', 'often'],
    required: true
  },

  // Pets
  has_pets: {
    type: String,
    enum: ['true', 'false'],
    required: true
  },
  pet_tolerance: {
    type: String,
    enum: ['no-pets', 'cats', 'dogs', 'both'],
    required: true
  },

  // Food & Kitchen
  cooking_frequency: {
    type: String,
    enum: ['never', 'sometimes', 'often', 'always'],
    required: true
  },
  diet_type: {
    type: String,
    enum: ['vegan', 'vegetarian', 'omnivore', 'pescatarian', 'other'],
    required: true
  },
  shared_groceries: {
    type: Boolean,
    default: false
  },

  // Work & Time
  work_hours: {
    type: String,
    enum: ['9-5', 'flexible', 'shift-work', 'other'],
    required: true
  },
  works_from_home: {
    type: Boolean,
    default: false
  },
  chronotype: {
    type: String,
    enum: ['early-bird', 'night-owl', 'flexible'],
    required: true
  },

  // Privacy & Shared Space
  privacy_level: {
    type: String,
    enum: ['high', 'medium', 'low'],
    required: true
  },
  shared_space_usage: {
    type: String,
    enum: ['private', 'shared', 'both'],
    required: true
  },

  // Status flag
  form_completed: {
    type: Boolean,
    default: false
  },
  relationship_status: {
    type: String,
    enum: ['single', 'in-a-relationship', 'married', 'divorced', 'widowed'],
    default: 'single'
  },
  // Optional fields
  bio: {
    type: String,
    maxlength: 500
  },
  photos: [{
    url: String,
    filename: String,
    mimetype: String
  }],
  location: {
    city: String,
    country: String,
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },

}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);
