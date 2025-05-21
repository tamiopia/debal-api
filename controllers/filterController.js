const User = require('../models/User');
const Profile = require('../models/Profile');
const mongoose = require('mongoose');

const filterUsers = async (req, res) => {
    try {
      const {
        gender,
        ageMin,
        ageMax,
        occupation,
        religion,
        city,
        country,
        isOnline,
        hasPets
      } = req.query;
  
      const matchProfile = {};
  
      if (gender) matchProfile.gender = gender;
      if (occupation) matchProfile.occupation = occupation;
      if (religion) matchProfile.religion = religion;
      if (city) matchProfile['location.city'] = city;
      if (country) matchProfile['location.country'] = country;
      if (hasPets) matchProfile.has_pets = hasPets === 'true'; // make sure it's boolean
      if (ageMin || ageMax) {
        matchProfile.age = {};
        if (ageMin) matchProfile.age.$gte = parseInt(ageMin);
        if (ageMax) matchProfile.age.$lte = parseInt(ageMax);
      }
  
      const pipeline = [
        { $match: matchProfile },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' }
      ];
  
      // If filtering by online status, apply match here
      if (isOnline) {
        pipeline.push({
          $match: {
            'user.isOnline': isOnline === 'true'
          }
        });
      }
  
      // Final projection
      pipeline.push({
        $project: {
          _id: 0,
          user_id: '$user._id',
          name: '$user.name',
          email: '$user.email',
          avatar: '$user.avatar',
          isOnline: '$user.isOnline',
          role: '$user.role',
          age: '$age',
          gender: '$gender',
          occupation: '$occupation',
          religion: '$religion',
          location: '$location',
          has_pets: '$has_pets',
          hobbies: '$hobbies',
          photos: '$photos'
        }
      });
  
      const results = await Profile.aggregate(pipeline);
      res.status(200).json(results);
  
    } catch (error) {
      console.error('Error in filterUsers:', error.message);
      res.status(500).json({ error: 'Server error while filtering users' });
    }
  };
  
const filterUser = async (req, res) => {
    try {
      const { gender, ageMin, ageMax, location, radius = 10 } = req.query;
  
      const query = {};
  
      // Gender filter
      if (gender) {
        query.gender = gender;
      }
  
      // Age filter
      if (ageMin || ageMax) {
        query.age = {};
        if (ageMin) query.age.$gte = Number(ageMin);
        if (ageMax) query.age.$lte = Number(ageMax);
      }
  
      // Location filter (geospatial)
      if (location) {
        const [longitude, latitude] = location.split(',').map(Number);
  
        if (!isNaN(longitude) && !isNaN(latitude)) {
          query['location.coordinates'] = {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [longitude, latitude],
              },
              $maxDistance: radius * 1609.34, // miles to meters
            },
          };
        } else {
          return res.status(400).json({ error: 'Invalid location coordinates' });
        }
      }
  
      const users = await User.find(query).select('-password'); // exclude sensitive data like password
  
      res.json(users);
    } catch (err) {
      console.error('Error filtering users:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  const getUsersFeed = async (req, res) => {
    try {
      const currentUserId = req.user.id; // assuming your auth middleware sets this
  
      const profiles = await Profile.aggregate([
        // Join with Users
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
  
        // Exclude the current user and deleted users
        {
          $match: {
            'user._id': { $ne: new mongoose.Types.ObjectId(currentUserId) },
            'user.isdeleted': { $ne: true }
          }
        },
  
        // Randomize
        { $sample: { size: 10 } }
      ]);
  
      const formatted = profiles.map((profile) => {
        const user = profile.user;
  
        let budgetRangeFormatted = profile.budget_range;
        if (Array.isArray(profile.budget_range)) {
          budgetRangeFormatted = {
            min: profile.budget_range[0],
            max: profile.budget_range[1]
          };
        }
  
        return {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isOnline: user.isOnline,
            isVerified: user.isVerified,
            isblocked: user.isblocked,
            issuspended: user.issuspended,
            isdeleted: user.isdeleted,
            isreported: user.isreported
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
          hobbies: profile.hobbies || [],
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
          photos: profile.photos || [],
          form_completed: profile.form_completed,
          recommendationSettings: profile.recommendationSettings || {}
        };
      });
  
      return res.status(200).json({ feed: formatted });
    } catch (err) {
      console.error('Error in getUsersFeed:', err.message);
      return res.status(500).json({ error: 'Failed to load user feed' });
    }
  };
  
  
   

module.exports = {
    filterUsers
    , filterUser,
    getUsersFeed
}