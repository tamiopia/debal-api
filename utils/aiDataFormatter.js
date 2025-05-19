// utils/aiDataFormatter.js
function formatForAI(profile, userId) {
    const createdAt = new Date().toISOString();
  
    const enums = {
      gender: ['male', 'female', 'non-binary', 'prefer-not-to-say'],
      personality_type: ['introvert', 'extrovert', 'ambivert'],
      sleep_pattern: ['early-bird', 'night-owl', 'flexible'],
      pet_tolerance: ['no-pets', 'cats', 'dogs', 'both'],
      cleanliness_level: ['very-clean', 'clean', 'average', 'messy'],
      smoking: ['Smoker', 'Non-smoker']
    };
  
    const defaults = {
      personality_type: 'ambivert',
      sleep_pattern: 'flexible',
      pet_tolerance: 'no-pets',
      has_pets: 'no',
      cleanliness_level: 'average',
      smoking: 'Non-smoker'
    };
  
    return {
      user_id: `user_${String(userId).padStart(3, '0')}`,
      age: Number.isInteger(profile.age) ? profile.age : 25,
      gender: enums.gender.includes(profile.gender) ? profile.gender : 'prefer-not-to-say',
      personality_type: enums.personality_type.includes(profile.personality_type)
        ? profile.personality_type
        : defaults.personality_type,
      sleep_pattern: enums.sleep_pattern.includes(profile.sleep_pattern)
        ? profile.sleep_pattern
        : defaults.sleep_pattern,
      hobbies: Array.isArray(profile.hobbies)
        ? profile.hobbies.map(h => String(h).toLowerCase())
        : [],
      pet_tolerance: enums.pet_tolerance.includes(profile.pet_tolerance)
        ? profile.pet_tolerance
        : defaults.pet_tolerance,
      has_pets: profile.has_pets === true || profile.has_pets === 'true' ? 'yes' : 'no',
      smoking: enums.smoking.includes(profile.smoking)
        ? profile.smoking
        : defaults.smoking,
      cleanliness_level: enums.cleanliness_level.includes(profile.cleanliness_level)
        ? profile.cleanliness_level
        : defaults.cleanliness_level,
      created_at: createdAt,
      is_mock: 0
    };
  }
  
  module.exports = { formatForAI };
  