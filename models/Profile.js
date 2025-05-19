const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  // Personal Information
  bio: {
    type: String,
    maxlength: 500 // Max length for bio
  },
  phone_number:{
    type: String,
    maxlength: 20
  },
  social_media_links: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String,
    telegram: String
  },
  recommendations: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    matchPercentage: Number,
    lastUpdated: Date,
    compatibilityFactors: {
      lifestyle: Number,
      habits: Number,
      interests: Number
    }
  }],

  age: {
    type: Number,
    min: 18, // Must be at least 18
    max: 99 // Max age
  },
  gender: {
    type: String,
    enum: ['male', 'female'], // Gender options
    required: false
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
    required: false
  },

  // Neighborhood Preferences
  preferred_location_type: {
    type: String,
    enum: ['urban', 'suburban', 'rural'], // Living preference for location
    required: false
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
    required: false
  }],

  // Financial
  income_level: {
    type: String,
    maxlength: 50, // Allowing a range or description
    required: false
  },
  budget_range: {
    min: {
      type: Number,
      required: false
    },
    max: {
      type: Number,
      required: false
    }
  },

  // Shared Living Preferences
  cleanliness_level: {
    type: String,
    enum: ['very-clean', 'clean', 'average', 'messy'],
    required: false
  },
  chore_sharing_preference: {
    type: String,
    enum: ['share', 'separate'],
    required: false
  },
  noise_tolerance: {
    type: String,
    enum: ['quiet', 'average', 'noisy'],
    required: false
  },
  guest_frequency: {
    type: String,
    enum: ['never', 'rarely', 'sometimes', 'often'],
    required: false
  },
  party_habits: {
    type: String,
    enum: ['never', 'rarely', 'sometimes', 'often'],
    required: false
  },

  // Pets
  has_pets: {
    type: String,
    enum: ['false', 'true'],
    required: false
  },
  pet_tolerance: {
    type: String,
    enum: ['no-pets', 'cats', 'dogs', 'both'],
    required:false
  },

  // Food & Kitchen
  cooking_frequency: {
    type: String,
    enum: ['never', 'sometimes', 'often', 'always'],
    required:false
  },
  diet_type: {
    type: String,
    enum: ['vegan', 'vegetarian', 'omnivore', 'pescatarian', 'other'],
    required:false
  },
  shared_groceries: {
    type: Boolean,
    default: false
  },

  // Work & Time
  work_hours: {
    type: String,
    enum: ['9-5', 'flexible', 'shift-work', 'other'],
    required:false
  },
  works_from_home: {
    type: Boolean,
    default: false
  },
  chronotype: {
    type: String,
    enum: ['early-bird', 'night-owl', 'flexible'],
    required:false
  },

  // Privacy & Shared Space
  privacy_level: {
    type: String,
    enum: ['high', 'medium', 'low'],
    required:false
  },
  shared_space_usage: {
    type: String,
    enum: ['private', 'shared', 'both'],
    required:false
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
    mimetype: String,
    isProfile: { type: Boolean, default: false }
  }],
  location: {
    city: String,
    country: String,
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  
  recommendationSettings: {
    dailyUpdates: { type: Boolean, default: true },
    minMatchPercentage: { type: Number, default: 70 }
  }

}, { timestamps:true });

module.exports = mongoose.model("Profile", profileSchema);
