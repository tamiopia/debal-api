const Profile = require('../models/Profile');
const User = require('../models/User');
const fs = require('fs');

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
  try {
    // Get uploaded files
    const photos = req.files?.map(file => ({
      url: file.path,
      filename: file.filename,
      mimetype: file.mimetype
    })) || [];

    // Build profile object
    const profileFields = {
      user: req.user.id,
      photos
    };

    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Delete old photos if they exist
      if (profile.photos?.length) {
        profile.photos.forEach(photo => {
          fs.unlink(photo.url, err => {
            if (err) console.error('Error deleting old photo:', err);
          });
        });
      }
      
      // Update profile
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }

    // Create new profile
    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);

  } catch (err) {
    // Delete any uploaded files if error occurs
    if (req.files?.length) {
      req.files.forEach(file => {
        fs.unlink(file.path, err => {
          if (err) console.error('Error cleaning up uploaded file:', err);
        });
      });
    }
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




// Middleware helper
const updateOrCreateProfile = async (userId, updateData) => {
  return await Profile.findOneAndUpdate(
    { user: userId },
    { $set: updateData },
    { new: true, upsert: true, runValidators: true }
  );
};

// Page 1 - Personal Info
exports.savePersonalInfo = async (req, res) => {
  try {
    const profile = await updateOrCreateProfile(req.user.id, {
      age: req.body.age,
      gender: req.body.gender,
      occupation: req.body.occupation,
      religion: req.body.religion,
      relationship_status: req.body.relationship_status,
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Page 2 - Lifestyle
exports.saveLifestyle = async (req, res) => {
  try {
    const profile = await updateOrCreateProfile(req.user.id, {
      personality_type: req.body.personality_type,
      daily_routine: req.body.daily_routine,
      sleep_pattern: req.body.sleep_pattern
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add remaining controllers below

// Page 3 - Neighborhood Preferences
exports.saveNeighborhoodPreferences = async (req, res) => {
  try {
    const profile = await updateOrCreateProfile(req.user.id, {
      preferred_location_type: req.body.preferred_location_type,
      commute_tolerance_minutes: req.body.commute_tolerance_minutes
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Page 4 - Hobbies
exports.saveHobbies = async (req, res) => {
  try {
    const profile = await updateOrCreateProfile(req.user.id, {
      hobbies: req.body.hobbies
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Page 5 - Financial
exports.saveFinancial = async (req, res) => {
  try {
    const profile = await updateOrCreateProfile(req.user.id, {
      income_level: req.body.income_level,
      budget_range: req.body.budget_range
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Page 6 - Shared Living Preferences
exports.saveSharedLiving = async (req, res) => {
  try {
    const profile = await updateOrCreateProfile(req.user.id, {
      cleanliness_level: req.body.cleanliness_level,
      chore_sharing_preference: req.body.chore_sharing_preference,
      noise_tolerance: req.body.noise_tolerance,
      guest_frequency: req.body.guest_frequency,
      party_habits: req.body.party_habits
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Page 7 - Pets
exports.savePets = async (req, res) => {
  try {
    const profile = await updateOrCreateProfile(req.user.id, {
      has_pets: req.body.has_pets,
      pet_tolerance: req.body.pet_tolerance
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Page 8 - Food & Kitchen
exports.saveFood = async (req, res) => {
  try {
    const profile = await updateOrCreateProfile(req.user.id, {
      cooking_frequency: req.body.cooking_frequency,
      diet_type: req.body.diet_type,
      shared_groceries: req.body.shared_groceries
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Page 9 - Work & Time
exports.saveWork = async (req, res) => {
  try {
    const profile = await updateOrCreateProfile(req.user.id, {
      work_hours: req.body.work_hours,
      works_from_home: req.body.works_from_home,
      chronotype: req.body.chronotype
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Page 10 - Privacy
exports.savePrivacy = async (req, res) => {
  try {
    const profile = await updateOrCreateProfile(req.user.id, {
      privacy_level: req.body.privacy_level,
      shared_space_usage: req.body.shared_space_usage
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Page 11 - Final Step
exports.markFormCompleted = async (req, res) => {
  try {
    const profile = await updateOrCreateProfile(req.user.id, {
      form_completed: true
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

