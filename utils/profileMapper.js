// utils/profileMapper.js
function mapProfileToAIInput(profile) {
    return {
      user_id: profile.user._id.toString(),
      age: profile.age,
      gender: profile.gender,
      personality_type: profile.personality_type,
      sleep_pattern: profile.sleep_pattern || profile.chronotype,
      hobbies: profile.hobbies,
      pet_tolerance: profile.pet_tolerance,
      has_pets: profile.has_pets === 'true',
      smoking: profile.smoking || (profile.party_habits === 'often' ? 'Smoker' : 'Non-smoker'),
      cleanliness_level: profile.cleanliness_level,
      additional_factors: {
        work_schedule: profile.work_hours,
        cooking_habits: profile.cooking_frequency,
        noise_preference: profile.noise_tolerance,
        guest_preference: profile.guest_frequency
      }
    };
  }