// models/Recommendation.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const compatibilityFactorsSchema = new Schema({
  lifestyle: { type: Number, min: 0, max: 100 },
  habits: { type: Number, min: 0, max: 100 },
  interests: { type: Number, min: 0, max: 100 },
  personality: { type: Number, min: 0, max: 100 },
  livingStyle: { type: Number, min: 0, max: 100 }
});

const recommendationSchema = new Schema({
  // Reference to the user who received the recommendation
  forUser: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true 
  },
  
  // Reference to the recommended user
  recommendedUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // AI service references
  aiForUserId: { type: String, index: true },  // User ID in AI system
  aiRecommendedUserId: { type: String },      // Recommended user ID in AI system
  
  // Compatibility metrics
  matchPercentage: { 
    type: Number, 
    min: 0, 
    max: 100,
    required: true 
  },
  compatibilityFactors: compatibilityFactorsSchema,
  
  // Cluster information
  clusterId: { type: Number },
  clusterMatchScore: { type: Number },
  
  // Matching details
  sharedTraits: [{ type: String }],
  matchReasons: [{ type: String }],
  
  // System metadata
  source: { 
    type: String, 
    enum: ['initial', 'daily', 'manual', 'retrain'],
    default: 'initial'
  },
  isActive: { type: Boolean, default: true },
  viewed: { type: Boolean, default: false },
  saved: { type: Boolean, default: false },
  dismissed: { type: Boolean, default: false },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date } // For temporary recommendations
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
recommendationSchema.index({ forUser: 1, matchPercentage: -1 });
recommendationSchema.index({ forUser: 1, isActive: 1 });
recommendationSchema.index({ forUser: 1, createdAt: -1 });
recommendationSchema.index({ recommendedUser: 1 });
recommendationSchema.index({ clusterId: 1 });

// Virtual population
recommendationSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'recommendedUser',
  foreignField: '_id',
  justOne: true
});

// Pre-save hook to set expiration
recommendationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Default expiration in 7 days
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Recommendation', recommendationSchema);