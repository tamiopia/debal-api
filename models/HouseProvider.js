const mongoose = require('mongoose');

const houseProviderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: String,
  licenseNumber: String,
  contactPhone: String,
  verified: {
    type: Boolean,
    default: false
  },
  properties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HouseListing'
  }]
}, { timestamps: true });

module.exports = mongoose.model('HouseProvider', houseProviderSchema);