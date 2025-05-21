const Profile = require('../models/Profile');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

require('dotenv').config();
// @desc    Get current user's profile
// @route   GET /api/profiles/me
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from request
    const profile = await Profile.findOne({ user: req.user.id })
      .populate('user', ['name', 'email', 'avatar','role','isOnline','isVerified','isblocked','issuspended','isdeleted','isreported']);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Optional: normalize budget_range if stored as string or array
    let budgetRangeFormatted = profile.budget_range;
    if (Array.isArray(profile.budget_range)) {
      budgetRangeFormatted = {
        min: profile.budget_range[0],
        max: profile.budget_range[1]
      };
    }

    res.json({
      user: profile.user,
      personalInfo: {
        age: profile.age,
        gender: profile.gender,
        occupation: profile.occupation,
        religion: profile.religion,
        relationship_status: profile.relationship_status,
        bio: profile.bio,
        phone_number: profile.phone_number,
        social_media_links: profile.social_media_links
      },
      lifestyle: {
        personality_type: profile.personality_type,
        daily_routine: profile.daily_routine,
        sleep_pattern: profile.sleep_pattern
      },
      neighborhoodPrefs: {
        preferred_location_type: profile.preferred_location_type,
        commute_tolerance_minutes: profile.commute_tolerance_minutes
      },
      hobbies: profile.hobbies,
      financial: {
        income_level: profile.income_level,
        budget_range: budgetRangeFormatted
      },
      sharedLiving: {
        cleanliness_level: profile.cleanliness_level,
        chore_sharing_preference: profile.chore_sharing_preference,
        noise_tolerance: profile.noise_tolerance,
        guest_frequency: profile.guest_frequency,
        party_habits: profile.party_habits
      },
      pets: {
        has_pets: profile.has_pets,
        pet_tolerance: profile.pet_tolerance
      },
      food: {
        cooking_frequency: profile.cooking_frequency,
        diet_type: profile.diet_type,
        shared_groceries: profile.shared_groceries
      },
      work: {
        work_hours: profile.work_hours,
        works_from_home: profile.works_from_home,
        chronotype: profile.chronotype
      },
      privacy: {
        privacy_level: profile.privacy_level,
        shared_space_usage: profile.shared_space_usage
      },
      photos: profile.photos,
      form_completed: profile.form_completed,
      recommendationSettings: profile.recommendationSettings
    });

  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ error: err.message });
  }
};


// @desc    Create or update profile
// @route   POST /api/profiles
exports.createOrUpdateProfile = async (req, res) => {
  try {
    // Parse the is_profile_flags array from form
    const isProfileFlags = req.body.is_profile_flags || [];

    const newPhotos = req.files?.map((file, index) => ({
      url: file.path,
      filename: file.filename,
      mimetype: file.mimetype,
      is_profile: isProfileFlags[index] === 'true' // Accept only true string
    })) || [];

    // If multiple have is_profile true, keep only the last one
    let profilePhotoIndex = newPhotos.findIndex(p => p.is_profile);
    if (profilePhotoIndex !== -1) {
      newPhotos = newPhotos.map((photo, i) => ({
        ...photo,
        is_profile: i === profilePhotoIndex
      }));
    }

    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Append new photos to existing ones
      profile.photos = [...profile.photos, ...newPhotos];

      // Ensure only one profile photo overall
      const allPhotos = profile.photos;
      const lastProfilePhotoIndex = [...allPhotos].reverse().findIndex(p => p.is_profile);
      const correctIndex = allPhotos.length - 1 - lastProfilePhotoIndex;
      profile.photos = allPhotos.map((photo, idx) => ({
        ...photo,
        is_profile: idx === correctIndex
      }));

      await profile.save();
      return res.json(profile);
    }

    // Create new profile
    const profileFields = {
      user: req.user.id,
      photos: newPhotos
    };

    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);

  } catch (err) {
    if (req.files?.length) {
      req.files.forEach(file => {
        fs.unlink(file.path, err => {
          if (err) console.error('Cleanup error:', err);
        });
      });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const filename = req.params.filename;

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const photoIndex = profile.photos.findIndex(photo => photo.filename === filename);
    if (photoIndex === -1) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const photo = profile.photos[photoIndex];

    // Delete file from disk
    fs.unlink(photo.url, (err) => {
      if (err) console.error('Error deleting file from disk:', err);
    });

    // Remove photo from array
    profile.photos.splice(photoIndex, 1);

    await profile.save();

    res.json({ message: 'Photo deleted successfully', profile });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const filename = req.params.filename;

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    let photoFound = false;

    profile.photos = profile.photos.map(photo => {
      if (photo.filename === filename) {
        photoFound = true;
        return { ...photo.toObject(), isProfile: true };
      }
      return { ...photo.toObject(), isProfile: false };
    });

    if (!photoFound) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    await profile.save();
    res.json({ message: 'Profile photo updated', profile });

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
      .populate('user', ['name', 'email', 'avatar','role','isOnline','isVerified','isblocked','issuspended','isdeleted','isreported']);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Optional: normalize budget_range if stored as array
    let budgetRangeFormatted = profile.budget_range;
    if (Array.isArray(profile.budget_range)) {
      budgetRangeFormatted = {
        min: profile.budget_range[0],
        max: profile.budget_range[1]
      };
    }

    res.json({
      user: profile.user,
      personalInfo: {
        age: profile.age,
        gender: profile.gender,
        occupation: profile.occupation,
        religion: profile.religion,
        relationship_status: profile.relationship_status,
        bio: profile.bio,
        phone_number: profile.phone_number,
        social_media_links: profile.social_media_links
      },
      lifestyle: {
        personality_type: profile.personality_type,
        daily_routine: profile.daily_routine,
        sleep_pattern: profile.sleep_pattern
      },
      neighborhoodPrefs: {
        preferred_location_type: profile.preferred_location_type,
        commute_tolerance_minutes: profile.commute_tolerance_minutes
      },
      hobbies: profile.hobbies,
      financial: {
        income_level: profile.income_level,
        budget_range: budgetRangeFormatted
      },
      sharedLiving: {
        cleanliness_level: profile.cleanliness_level,
        chore_sharing_preference: profile.chore_sharing_preference,
        noise_tolerance: profile.noise_tolerance,
        guest_frequency: profile.guest_frequency,
        party_habits: profile.party_habits
      },
      pets: {
        has_pets: profile.has_pets,
        pet_tolerance: profile.pet_tolerance
      },
      food: {
        cooking_frequency: profile.cooking_frequency,
        diet_type: profile.diet_type,
        shared_groceries: profile.shared_groceries
      },
      work: {
        work_hours: profile.work_hours,
        works_from_home: profile.works_from_home,
        chronotype: profile.chronotype
      },
      privacy: {
        privacy_level: profile.privacy_level,
        shared_space_usage: profile.shared_space_usage
      },
      photos: profile.photos,
      form_completed: profile.form_completed,
      recommendationSettings: profile.recommendationSettings
    });

  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Invalid user ID format' });
    }
    console.error('Error fetching profile by userId:', err);
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
    const {
      age,
      gender,
      occupation,
      religion,
      relationship_status,
      bio,
      phone_number,
      social_media_links,
      fullname
    } = req.body;

    // Update name in User model if fullname is provided
    if (fullname) {
      await User.findByIdAndUpdate(req.user.id, { name: fullname });
    }

    // Update or create the profile
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      {
        $set: {
          age,
          gender,
          occupation,
          religion,
          relationship_status,
          bio,
          phone_number,
          social_media_links
        }
      },
      { new: true, upsert: true }
    );

    res.json(profile);

  } catch (err) {
    console.error('Error saving personal info:', err);
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

const RecommendationService = require('../services/recommendationService');




// controllers/profileController.js
const { formatForAI } = require('../utils/aiDataFormatter');
const axios = require('axios');


exports.markFormCompleted = async (req, res) => {
  try {
    // 1. Update profile completion status and get full profile data
    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { form_completed: true },
      { new: true }
    ).lean();

    if (!profile) {
      return res.status(404).json({ 
        success: false,
        error: "Profile not found" 
      });
    }

    // 2. Format profile data for AI service
    const aiData = formatForAI(
      {
        ...profile,
        // Adjusted fields
        smoking: profile.smoking_preference,
        has_pets: profile.has_pets
      },
      req.user.id // <== PASS USER ID EXPLICITLY
    );
    

    console.log('Formatted AI Data:', aiData);

    // 3. Add user to AI model

    const baseUrl = process.env.RECOMMENDATION_SERVICE_URL;
    const aiResponse = await axios.post(
      `${baseUrl}/add_model_user`,
      aiData,
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000 // 10 second timeout
      }
    );

    if (aiResponse.status !== 200) {
      throw new Error("Failed to add user to AI model");
    }
    console.log('AI Response:', aiResponse.data);

    // 4. Get initial recommendations
    // const recommendationsResponse = await axios.get(
    //   `https://d49a-35-243-230-231.ngrok-free.app/recommend/${aiResponse.data.user_id}`,
    //   { 
    //     params: { n: profile.recommendationSettings?.minMatches || 5 },
    //     timeout: 30000
    //   }
    // );

    // 5. Update profile with recommendations
    // const updatedProfile = await Profile.findOneAndUpdate(
    //   { user: req.user._id },
    //   {
    //     $set: {
    //       aiUserId: aiResponse.data.user_id,
    //       recommendations: recommendationsResponse.data.recommendations.map(rec => ({
    //         userId: rec.user_id,
    //         matchPercentage: Math.round(rec.compatibility_score * 100),
    //         lastUpdated: new Date(),
    //         compatibilityFactors: {
    //           lifestyle: Math.round((rec.compatibility_score * 0.4) * 100),
    //           habits: Math.round((rec.compatibility_score * 0.3) * 100),
    //           interests: Math.round((rec.compatibility_score * 0.3) * 100)
    //         },
    //         clusterId: rec.cluster_id
    //       })),
    //       'metrics.clusterId': recommendationsResponse.data.cluster_info?.cluster_id,
    //       'metrics.lastRecommendationUpdate': new Date()
    //     }
    //   },
    //   { new: true }
    // );

    // 6. Schedule daily updates if enabled
    // if (profile.recommendationSettings?.dailyUpdates) {
    //   const { scheduleRecommendationUpdates } = require('../services/scheduler');
    //   scheduleRecommendationUpdates(req.user._id);
    // }

    // 7. Return success response
    res.json({
      success: true,
      message: "Profile completed and recommendations generated",
      
    });

  } catch (error) {
    console.error('Profile completion error:', error);

    // Enhanced error response
    const errorResponse = {
      success: false,
      error: "Failed to complete profile",
      code: "PROFILE_COMPLETION_FAILED"
    };

    if (error.response) {
      // AI service returned an error
      errorResponse.details = {
        status: error.response.status,
        message: error.response.data?.message || "AI service error",
        code: error.response.data?.code
      };
    } else if (error.request) {
      // The request was made but no response received
      errorResponse.error = "AI service did not respond";
      errorResponse.code = "AI_SERVICE_TIMEOUT";
    }

    res.status(error.response?.status || 500).json(errorResponse);
  }
};

// Example of a function to fetch user data by user_id from your database or external service.
const getUserById = async (userId) => {
  try {
    const profile = await Profile.findOne({ user: userId }).populate('user', [
      'name',
      'email',
      'avatar',
      'role',
      'isOnline',
      'isVerified',
      'isblocked',
      'issuspended',
      'isdeleted',
      'isreported'
    ]);

    if (!profile || !profile.user) {
      throw new Error('User profile not found');
    }

    let budgetRangeFormatted = profile.budget_range;
    if (Array.isArray(profile.budget_range)) {
      budgetRangeFormatted = {
        min: profile.budget_range[0],
        max: profile.budget_range[1]
      };
    }

    return {
      user: {
        _id: profile.user._id,
        name: profile.user.name,
        email: profile.user.email,
        role: profile.user.role,
        isOnline: profile.user.isOnline,
        isVerified: profile.user.isVerified,
        isblocked: profile.user.isblocked,
        issuspended: profile.user.issuspended,
        isdeleted: profile.user.isdeleted,
        isreported: profile.user.isreported
      },
      personalInfo: {
        age: profile.age,
        gender: profile.gender,
        occupation: profile.occupation,
        religion: profile.religion,
        relationship_status: profile.relationship_status,
        bio: profile.bio,
        phone_number: profile.phone_number,
        social_media_links: profile.social_media_links
      },
      lifestyle: {
        personality_type: profile.personality_type,
        daily_routine: profile.daily_routine,
        sleep_pattern: profile.sleep_pattern
      },
      neighborhoodPrefs: {
        preferred_location_type: profile.preferred_location_type,
        commute_tolerance_minutes: profile.commute_tolerance_minutes
      },
      hobbies: profile.hobbies,
      financial: {
        income_level: profile.income_level,
        budget_range: budgetRangeFormatted || {}
      },
      sharedLiving: {
        cleanliness_level: profile.cleanliness_level,
        chore_sharing_preference: profile.chore_sharing_preference,
        noise_tolerance: profile.noise_tolerance,
        guest_frequency: profile.guest_frequency,
        party_habits: profile.party_habits
      },
      pets: {
        has_pets: profile.has_pets,
        pet_tolerance: profile.pet_tolerance
      },
      food: {
        cooking_frequency: profile.cooking_frequency,
        diet_type: profile.diet_type,
        shared_groceries: profile.shared_groceries
      },
      work: {
        work_hours: profile.work_hours,
        works_from_home: profile.works_from_home,
        chronotype: profile.chronotype
      },
      privacy: {
        privacy_level: profile.privacy_level,
        shared_space_usage: profile.shared_space_usage
      },
      photos: profile.photos,
      form_completed: profile.form_completed,
      recommendationSettings: profile.recommendationSettings
    };

  } catch (err) {
    console.error('Error in getUserById:', err.message);
    return null;
  }
};

async function getAllUsers() {
  try {
      const users = await User.find({ role:"user" }).populate('profile');
      return users;
  } catch (error) {
      console.error("Error fetching all users:", error);
      return []; // Return an empty array to avoid errors in later processing.
  }
}
// Assuming a function that fetches user data by ID from your DB/API

exports.getRecommendations = async (req, res) => {
  try {
    const minMatches = req.user.recommendationSettings?.minMatches || 5;
     const baseUrl = process.env.RECOMMENDATION_SERVICE_URL;

    if (!baseUrl) {
      throw new Error('AI_SERVICE_URL environment variable is not set');
    }
    const recommendationsResponse = await axios.get(
      `${baseUrl}/recommend/user_${req.user.id}`, // URL from environment variable
      {
      params: { n: minMatches },
      timeout: 30000,
      }
    );

    const data = recommendationsResponse.data;

    if (!Array.isArray(data.recommendations)) {
      throw new Error("Invalid recommendation format received from AI service");
    }

    const recommendationsWithUserDetails = await Promise.all(
      data.recommendations.map(async (recommendation) => {
        let user;
        if (recommendation.user_id.startsWith("user_")) {
          // Fetch from your database
          const userId = recommendation.user_id.slice("user_".length); // Extract user ID
          user = await getUserById(userId); // Your database query function
          console.log("Fetched user from DB:", user);
        } else if (recommendation.user_id.startsWith("mock_")) {
          console.log("Skipping Mock User", recommendation.user_id)
          return null // Or handle mock user however you prefer
        } else {
          // Handle other user ID formats if needed (e.g. from other services)
          user = await getUserById(recommendation.user_id);
          console.log("Fetched user by Other ID:", user);
        }



        if (user) {

          return {
            ...recommendation,
            user,
          };
        }
        return null; // Skip if user not found
      })
    );

    const filteredRecommendations = recommendationsWithUserDetails.filter(rec => rec !== null);


    res.status(200).json({
      recommendations: filteredRecommendations, // Send filtered results
      // cluster_info: data.cluster_info,
      // model_metrics: data.model_metrics,
    });
  } catch (err) {
    console.error("Error fetching recommendations:", err); // Log the full error
    res.status(500).json({ error: "Error fetching recommendations" });
  }
};





exports.updateRecommendationSettings = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { recommendationSettings: req.body },
      { new: true }
    );
    
    if (req.body.dailyUpdates) {
      scheduleDailyUpdates(req.user.id);
    }
    
    res.json(profile.recommendationSettings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//add social media links
exports.saveSocialMediaLinks = async (req, res) => {
  try {
    const profile = await updateOrCreateProfile(req.user.id, {
      social_media_links: req.body
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
