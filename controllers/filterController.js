const User = require('../models/User');
const Profile = require('../models/Profile');

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
   

module.exports = {
    filterUsers
    , filterUser
}