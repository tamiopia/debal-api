const mongoose = require('mongoose');
const HouseRule = require('./houseRules');

const houseListingSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HouseProvider',
    required: false
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  house_rules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HouseRule',
    required: false
  }],

  title: {
    type: String,
    required: true
  },
  description: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  rent: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    period: {
      type: String,
      enum: ['month', 'week', 'day']
    }
  },
  bedrooms: Number,
  bathrooms: Number,
  amenities: [String],
  images: [String],
  availableFrom: Date,
  rules: {
    petsAllowed: Boolean,
    smokingAllowed: Boolean,
    maxOccupants: Number
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available'
  },
  photos: [{
    url: String,
    description: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
}, { timestamps: true });

module.exports = mongoose.model('HouseListing', houseListingSchema);