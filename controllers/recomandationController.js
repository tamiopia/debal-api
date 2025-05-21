const axios = require('axios');
const cosineSimilarity = require('compute-cosine-similarity');
const Profile = require('../models/Profile');
const User = require('../models/User'); // Assuming you have a User model
const mongoose = require('mongoose');

// Utility to generate vector
function createFeatureVector(profile) {
    let vector = [];
  
    // Personal Information (limited use for compatibility, but could be included)
    vector.push(normalizeValue(profile.age, 18, 99));
    vector = vector.concat(oneHotEncode(profile.gender, ['male', 'female', 'other'])); // Include 'other' if needed
    vector = vector.concat(oneHotEncode(profile.religion, ['christianity', 'islam', 'hinduism', 'judaism', 'other', 'none']));
  
    // Lifestyle (important features)
    vector = vector.concat(oneHotEncode(profile.personality_type, ['introvert', 'extrovert', 'ambivert']));
    vector = vector.concat(oneHotEncode(profile.sleep_pattern, ['early-bird', 'night-owl', 'flexible']));
  
    // Neighborhood Preferences
    vector = vector.concat(oneHotEncode(profile.preferred_location_type, ['urban', 'suburban', 'rural']));
    vector.push(normalizeValue(profile.commute_tolerance_minutes, 0, 120));
  
    // Hobbies (important features)
    const hobbies = ['reading', 'sports', 'travelling', 'music', 'movies', 'gaming', 'cooking', 'art', 'board games'];
    vector = vector.concat(multiHotEncode(profile.hobbies, hobbies));
  
  
  
    // Financial (use with caution - might bias recommendations unfairly)
    // If using, normalize income and budget appropriately
    // Example:
    // vector.push(normalizeIncome(profile.income_level));
    // vector.push(normalizeBudget(profile.budget_range));
  
  
  
    // Shared Living Preferences (important features)
    vector = vector.concat(oneHotEncode(profile.cleanliness_level, ['very-clean', 'clean', 'average', 'messy']));
    vector = vector.concat(oneHotEncode(profile.chore_sharing_preference, ['share', 'separate']));
    vector = vector.concat(oneHotEncode(profile.noise_tolerance, ['quiet', 'average', 'noisy']));
    vector = vector.concat(oneHotEncode(profile.guest_frequency, ['never', 'rarely', 'sometimes', 'often']));
    vector = vector.concat(oneHotEncode(profile.party_habits, ['never', 'rarely', 'sometimes', 'often']));
  
    // Pets
    vector.push(profile.has_pets === 'true' ? 1 : 0); // Assuming 'true'/'false' strings
    vector = vector.concat(oneHotEncode(profile.pet_tolerance, ['no-pets', 'cats', 'dogs', 'both']));
  
  
  
    // ... Add other fields as needed, following the same encoding/normalization principles
  
    return vector;
  }
function calculateCompatibilityScore(user1, user2) {
    // 1. Feature Vector Creation
    const user1Vector = createFeatureVector(user1);
    const user2Vector = createFeatureVector(user2);
  
    // 2. Cosine Similarity Calculation
    const score = cosineSimilarity(user1Vector, user2Vector);
    return score;
  }
  function oneHotEncode(value, categories) {
    const encoded = Array(categories.length).fill(0);
    const index = categories.indexOf(value);
    if (index > -1) {
      encoded[index] = 1;
    }
    return encoded;
  }
  
  function multiHotEncode(values, categories) {
    const encoded = Array(categories.length).fill(0);
    for (const value of values) {
      const index = categories.indexOf(value);
      if (index > -1) {
        encoded[index] = 1;
      }
    }
    return encoded;
  }

  const getUserById = async (userId) => {
    try {
      const users = await User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId), is_mock: 0 } },
  
        {
          $lookup: {
            from: 'profiles',         // collection name in MongoDB
            localField: '_id',        // field from the User collection
            foreignField: 'user',     // field from the Profile collection
            as: 'profile'
          }
        },
        { $unwind: '$profile' },      // assuming one profile per user
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            profile_picture: 1,
            profile: {
              age: 1,
              personality_type: 1,
              hobbies: 1,
              cleanliness_level: 1
            }
          }
        }
      ]);
  
      if (!users || users.length === 0) {
        throw new Error(`User with ID ${userId} not found`);
      }
  
      return users[0]; // return the first and only matched user
    } catch (err) {
      console.error("Error fetching user:", err.message);
      return null;
    }
  };
  
  async function getAllUsersWithProfiles() {

    try {
      const usersWithProfiles = await User.aggregate([
  
        { $match: { role:"user" } }, // Filter out mock users if needed
        {
          $lookup: {
            from: 'profiles', // Ensure this collection name matches your setup
            localField: '_id',
            foreignField: 'user',
            as: 'profile'
          }
        },
        { $unwind: '$profile' },  // Deconstruct the 'profile' array
        { $project: { name: 1, email: 1, profile_picture: 1, 'profile': 1, _id: 1 } } // Include other user details and _id
  
      ]);
  
      return usersWithProfiles;
    } catch (error) {
      console.error("Error fetching all users with profiles:", error);
      return []; // Or handle the error as needed
    }
  }
  exports.getRecommendations = async (req, res) => {
    try {
      const minMatches = req.user.recommendationSettings?.minMatches || 5;
      const userId = req.user.id;
  
      let recommendations = [];
      let clusterInfo = null;
      let modelMetrics = null;
  
      try {
        // Try to fetch from AI API
        const apiRes = await axios.get(
          `https://5026-34-125-153-207.ngrok-free.app/recommend/user_${userId}`,
          {
            params: { n: minMatches },
            timeout: 30000,
          }
        );
  
        const data = apiRes.data;
  
        if (!Array.isArray(data.recommendations)) {
          throw new Error("Invalid AI API format");
        }
  
        clusterInfo = data.cluster_info || null;
        modelMetrics = data.model_metrics || null;
  
        recommendations = await Promise.all(
          data.recommendations.map(async (recommendation) => {
            if (recommendation.user_id.startsWith("mock_")) {
              console.log("Skipping mock user:", recommendation.user_id);
              return null;
            }
  
            const cleanUserId = recommendation.user_id.replace(/^user_/, '');
            const user = await getUserById(cleanUserId);
  
            if (!user) return null;
  
            return {
              ...recommendation,
              user_details: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                profile_picture: user.profile_picture,
                // Add more fields if needed
              },
            };
          })
        );
  
        recommendations = recommendations.filter(Boolean);
  
      } catch (apiError) {
        console.error("AI API Error:", apiError.message);
        console.warn("Falling back to local recommendation algorithm.");
  
        // Local fallback
        const currentUser = await User.aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(userId), is_mock: 0 } },
          {
            $lookup: {
              from: 'profiles',
              localField: '_id',
              foreignField: 'user',
              as: 'profile',
            },
          },
          { $unwind: '$profile' },
          {
            $project: {
              name: 1,
              email: 1,
              profile_picture: 1,
              "profile.age": 1,
              "profile.personality_type": 1,
              "profile.hobbies": 1,
              "profile.cleanliness_level": 1,
            },
          },
        ]);
  
        if (!currentUser?.length || !currentUser[0].profile) {
          return res.status(404).json({ error: "Current user or profile not found" });
        }
  
        const currentUserProfile = currentUser[0].profile;
  
        const allUsers = await getAllUsersWithProfiles();
  
        recommendations = allUsers
          .filter(user => user._id.toString() !== userId)
          .map(user => ({
            user_id: user._id.toString(),
            compatibility_score: generateCompatibilityScore(currentUserProfile, user.profile),
            user_details: {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              profile_picture: user.profile_picture,
            },
          }))
          .sort((a, b) => b.compatibility_score - a.compatibility_score)
          .slice(0, minMatches);
      }
  
      res.status(200).json({
        recommendations,
        clusterInfo,      // Optional metadata
        modelMetrics,     // Optional metadata
      });
  
    } catch (err) {
      console.error("Error generating recommendations:", err);
      return res.status(500).json({ error: "Error generating recommendations" });
    }
  };
  
