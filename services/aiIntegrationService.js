// services/aiIntegrationService.js
const axios = require('axios');
const logger = require('../utils/logger');

class AIIntegrationService {
  constructor() {
    this.baseURL = process.env.AI_SERVICE_URL;
    this.timeout = 10000; // 10 seconds
  }

  async addUserToModel(userData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/add_model_user`,
        userData,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: this.timeout
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error('Failed to add user to AI model:', error);
      throw new Error(`AI service error: ${error.response?.data?.detail || error.message}`);
    }
  }

  async getRecommendations(aiUserId, count = 5) {
    try {
      const response = await axios.get(
        `${this.baseURL}/recommend/${aiUserId}?n=${count}`,
        { timeout: this.timeout }
      );
      
      return response.data.recommendations;
    } catch (error) {
      logger.error('Failed to get recommendations:', error);
      throw new Error(`AI recommendation error: ${error.response?.data?.detail || error.message}`);
    }
  }

  async retrainModel() {
    try {
      const response = await axios.post(
        `${this.baseURL}/train_model`,
        {},
        { timeout: 30000 } // Longer timeout for training
      );
      return response.data;
    } catch (error) {
      logger.error('Failed to retrain model:', error);
      throw new Error(`AI training error: ${error.response?.data?.detail || error.message}`);
    }
  }
}

module.exports = new AIIntegrationService();