const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  participantHash: {  // New field for consistent comparison
    type: String,
    unique: true,
    index: true 
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, { timestamps: true });

// Add pre-save hook to generate consistent hash
conversationSchema.pre('save', function(next) {
  // Create a consistent string representation of sorted participant IDs
  this.participantHash = this.participants
    .map(id => id.toString())
    .sort()
    .join('_');
  next();
});

// Remove the old participants index and replace with these
conversationSchema.index({ participantHash: 1 }, { unique: true });
// conversationSchema.index({ participants: 1, updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);