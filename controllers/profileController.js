const Profile = require('../models/Profile');
const User = require('../models/User');

// @desc    Get current user's profile
// @route   GET /api/profiles/me
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })
      .populate('user', ['name', 'email', 'avatar']);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Create or update profile
// @route   POST /api/profiles
exports.createOrUpdateProfile = async (req, res) => {
  const {
    age,
    gender,
    bio,
    photos,
    location,
    occupation,
    lifestyle
  } = req.body;

  // Build profile object
  const profileFields = {
    user: req.user.id,
    age,
    gender,
    bio,
    photos,
    location,
    occupation,
    lifestyle
  };

  try {
    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Update
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }

    // Create
    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get all profiles
// @route   GET /api/profiles
exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find()
      .populate('user', ['name', 'email', 'avatar']);
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get profile by user ID
// @route   GET /api/profiles/user/:userId
exports.getProfileByUserId = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId })
      .populate('user', ['name', 'email', 'avatar']);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.status(500).json({ error: err.message });
  }
};