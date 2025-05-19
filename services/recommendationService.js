// services/recommendationService.js
const Recommendation = require('../models/Recommendation');
const User = require('../models/User');
const dotenv = require('dotenv');
require('dotenv').config();
class RecommendationService {
  constructor() {
    dotenv.config();
    this.recommendationTTL = process.env.RECOMMENDATION_TTL_DAYS || 7;
  }

  async saveRecommendations(forUserId, aiRecommendations, source = 'initial') {
    try {
      // 1. Get AI user IDs from our database
      const users = await User.find({
        aiUserId: { $in: aiRecommendations.map(r => r.user_id) }
      }).select('_id aiUserId');

      const userMap = users.reduce((map, user) => {
        map[user.aiUserId] = user._id;
        return map;
      }, {});

      // 2. Prepare recommendation documents
      const recommendationDocs = aiRecommendations.map(rec => ({
        forUser: forUserId,
        recommendedUser: userMap[rec.user_id],
        aiForUserId: aiRecommendations.requested_user_id,
        aiRecommendedUserId: rec.user_id,
        matchPercentage: Math.round(rec.compatibility_score * 100),
        compatibilityFactors: this._calculateFactors(rec),
        clusterId: rec.cluster_id,
        clusterMatchScore: this._calculateClusterScore(rec),
        sharedTraits: this._extractSharedTraits(rec),
        matchReasons: this._generateMatchReasons(rec),
        source,
        expiresAt: new Date(Date.now() + this.recommendationTTL * 24 * 60 * 60 * 1000)
      }));

      // 3. Bulk insert with conflict handling
      const bulkOps = recommendationDocs.map(doc => ({
        updateOne: {
          filter: {
            forUser: doc.forUser,
            recommendedUser: doc.recommendedUser,
            source: doc.source
          },
          update: { $set: doc },
          upsert: true
        }
      }));

      await Recommendation.bulkWrite(bulkOps);

      // 4. Return saved recommendations with user details
      return await Recommendation.find({ forUser: forUserId, source })
        .sort({ matchPercentage: -1 })
        .populate('userDetails', 'name avatar age gender occupation')
        .lean();

    } catch (error) {
      console.error('Failed to save recommendations:', error);
      throw new Error('Failed to save recommendations');
    }
  }

  _calculateFactors(rec) {
    return {
      lifestyle: Math.round((rec.compatibility_score * 0.4 + Math.random() * 0.1) * 100),
      habits: Math.round((rec.compatibility_score * 0.3 + Math.random() * 0.1) * 100),
      interests: Math.round((rec.compatibility_score * 0.2 + Math.random() * 0.1) * 100),
      personality: Math.round((rec.compatibility_score * 0.3 + Math.random() * 0.1) * 100),
      livingStyle: Math.round((rec.compatibility_score * 0.2 + Math.random() * 0.1) * 100)
    };
  }

  _calculateClusterScore(rec) {
    // Higher score if in same cluster
    if (rec.cluster_id === rec.requested_user_cluster_id) {
      return Math.round((rec.compatibility_score * 1.2) * 100);
    }
    return Math.round(rec.compatibility_score * 100);
  }

  _extractSharedTraits(rec) {
    const traits = [];
    if (rec.compatibility_score > 0.8) traits.push('high-compatibility');
    if (rec.personality_type === rec.requested_personality_type) traits.push('same-personality');
    if (rec.sleep_pattern === rec.requested_sleep_pattern) traits.push('same-sleep-pattern');
    return traits;
  }

  _generateMatchReasons(rec) {
    const reasons = [];
    if (rec.compatibility_score > 0.85) reasons.push('Excellent compatibility');
    if (rec.cluster_id === rec.requested_user_cluster_id) reasons.push('Same lifestyle cluster');
    if (rec.personality_type === rec.requested_personality_type) reasons.push('Matching personality');
    if (reasons.length === 0) reasons.push('Potential good match');
    return reasons;
  }
  async getActiveRecommendations(userId, limit = 10) {
    return Recommendation.find({
      forUser: userId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
    .sort({ matchPercentage: -1 })
    .limit(limit)
    .populate('userDetails', 'name avatar age gender occupation')
    .lean();
  }

  async dismissRecommendation(userId, recommendationId) {
    return Recommendation.updateOne({
      _id: recommendationId,
      forUser: userId
    }, {
      $set: {
        isActive: false,
        dismissed: true,
        updatedAt: new Date()
      }
    });
  }

  async saveRecommendation(userId, recommendationId) {
    return Recommendation.updateOne({
      _id: recommendationId,
      forUser: userId
    }, {
      $set: {
        saved: true,
        updatedAt: new Date()
      }
    });
  }

  async refreshRecommendations(userId) {
    const profile = await Profile.findOne({ user: userId });
    if (!profile?.aiUserId) throw new Error('User not registered in AI system');

    const response = await axios.get(
      `${process.env.AI_SERVICE_URL}/recommend/${profile.aiUserId}`
    );

    return this.saveRecommendations(
      userId,
      response.data.recommendations,
      'manual'
    );
  }

  // Other methods for getting, updating, etc.
}

module.exports = new RecommendationService();