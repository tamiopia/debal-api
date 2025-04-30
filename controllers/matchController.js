const User = require('../models/User');
const Profile = require('../models/Profile');
const Preference = require('../models/Preference');

// Calculate compatibility score (0-100)
const calculateScore = (userPref, potentialMatchPref) => {
  let score = 0;
  
  // Lifestyle Compatibility (50%)
  const lifestyleWeights = {
    cleanliness: 0.3,
    sleepSchedule: 0.2,
    smoking: 0.25,
    pets: 0.25
  };
  
  // Location Proximity (30%)
  // Budget Alignment (20%)
  
  // ... (detailed implementation below)
  
  return Math.min(100, Math.round(score));
};

// Get compatible matches
exports.getMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's preferences
    const userPreference = await Preference.findOne({ user: userId });
    if (!userPreference) {
      return res.status(400).json({ error: 'Please set your preferences first' });
    }
    
    // Find potential matches (excluding self)
    const allUsers = await User.find({ _id: { $ne: userId } });
    const matches = [];
    
    for (const user of allUsers) {
      const matchPreference = await Preference.findOne({ user: user._id });
      if (matchPreference) {
        const score = calculateScore(userPreference, matchPreference);
        if (score >= 60) { // Minimum threshold
          matches.push({
            user: user._id,
            score,
            profile: await Profile.findOne({ user: user._id })
          });
        }
      }
    }
    
    // Sort by highest score
    matches.sort((a, b) => b.score - a.score);
    
    res.json(matches.slice(0, 20)); // Return top 20 matches
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};