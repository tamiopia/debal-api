const HouseProvider = require('../models/HouseProvider');
const User = require('../models/User');

// Become a house provider
const registerProvider = async (req, res) => {
  try {
    const { companyName, licenseNumber, contactPhone } = req.body;
    const userId = req.user.id;

    // Check if user already a provider
    const existingProvider = await HouseProvider.findOne({ user: userId });
    if (existingProvider) {
      return res.status(400).json({ error: 'User is already a provider' });
    }

    const provider = await HouseProvider.create({
      user: userId,
      companyName,
      licenseNumber,
      contactPhone
    });

    // Update user role
    await User.findByIdAndUpdate(userId, { role: 'provider' });

    res.status(201).json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get provider profil
const getProviderProfile = async (req, res) => {
  try {
    const provider = await HouseProvider.findOne({ user: req.user.id })
      .populate('properties')
      .populate('user', 'name email');

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerProvider, getProviderProfile };
