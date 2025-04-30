const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: function() {
      return !(this.media || this.location);
    }
  },
  media: {
    type: {
      url: String,
      mediaType: {  // Simple string field
        type: String,
        enum: ['image', 'video', 'document']
      },
      thumbnail: String,
      size: Number,
      duration: Number
    },
    required: false
  },
  messageType: {
    type: String,
    enum: ['text', 'media', 'location'],
    default: 'text'
  },
  // location: {
  //   type: {
  //     type: String,
  //     enum: ['Point'],
  //     required: false
  //   },
  //   coordinates: {
  //     type: [Number],
  //     required:  false,
  //     validate: {
  //       validator: function(coords) {
  //         return coords.length === 2 && 
  //                coords[0] >= -180 && coords[0] <= 180 &&
  //                coords[1] >= -90 && coords[1] <= 90;
  //       },
  //       message: 'Coordinates must be [longitude, latitude] with valid values'
  //     }
  //   },
  //   name: String,
  //   address: String
  // }

  read: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, { timestamps: true });

// Add geospatial index for location searches
messageSchema.index({ sparse: true,
  partialFilterExpression: {
    'location.coordinates': { $exists: true }
  } });

module.exports = mongoose.model('Message', messageSchema);