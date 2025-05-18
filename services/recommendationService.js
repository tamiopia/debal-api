// services/recommendationService.js
const axios = require('axios');
const { mapProfileToAIInput } = require('../utils/profileMapper');

class RecommendationService {
  constructor(aiEndpoint) {
    this.aiEndpoint = aiEndpoint;
  }

  async getRecommendations(profile) {
    try {
      const aiPayload = {
        user_data: mapProfileToAIInput(profile),
        requirements: {
          min_score: profile.recommendationSettings?.minMatchPercentage / 100 || 0.7,
          filters: this.generateFilters(profile)
        }
      };

      const response = await axios.post(`${this.aiEndpoint}/recommend`, aiPayload, {
        headers: { 'Content-Type': 'application/json' }
      });

      return this.processAIResponse(response.data, profile.user._id);
    } catch (error) {
      console.error('AI Recommendation Error:', error);
      throw new Error('Failed to get recommendations');
    }
  }

  generateFilters(profile) {
    const filters = {};
    
    // Pet filters
    if (profile.pet_tolerance === 'no-pets') {
      filters.has_pets = false;
    }
    
    // Smoking filters
    if (profile.smoking === 'Non-smoker') {
      filters.smoking = false;
    }
    
    // Sleep schedule compatibility
    if (profile.sleep_pattern) {
      filters.sleep_compatibility = profile.sleep_pattern === 'flexible' ? 
        ['early-bird', 'night-owl'] : 
        [profile.sleep_pattern];
    }
    
    return filters;
  }

  processAIResponse(aiData, userId) {
    return aiData.recommendations.map(rec => ({
      userId: rec.user_id,
      matchPercentage: Math.round(rec.score * 100),
      lastUpdated: new Date(),
      compatibilityFactors: {
        lifestyle: Math.round(rec.factors.lifestyle * 100),
        habits: Math.round(rec.factors.habits * 100),
        interests: Math.round(rec.factors.interests * 100)
      },
      sharedTraits: rec.shared_traits,
      matchReasons: rec.match_reasons
    }));
  }
}

module.exports = new RecommendationService(process.env.AI_RECOMMENDER_URL);