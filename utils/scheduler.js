// utils/scheduler.js
const cron = require('node-cron');
const Profile = require('../models/Profile');
const RecommendationService = require('../services/recommendationService');

const jobs = new Map();

async function updateUserRecommendations(userId) {
  try {
    const profile = await Profile.findOne({ user: userId }).populate('user');
    if (!profile || !profile.form_completed) return;

    const recommendations = await RecommendationService.getRecommendations(profile);
    
    profile.recommendations = recommendations;
    await profile.save();
    
    console.log(`Updated recommendations for user ${userId}`);
  } catch (error) {
    console.error(`Failed to update recommendations for ${userId}:`, error);
  }
}

function scheduleDailyUpdates(userId) {
  // Cancel existing job if any
  if (jobs.has(userId)) {
    jobs.get(userId).stop();
  }

  // Schedule new job (runs at 3 AM daily)
  const job = cron.schedule('0 3 * * *', () => updateUserRecommendations(userId));
  
  jobs.set(userId, job);
  console.log(`Scheduled daily updates for user ${userId}`);
}

module.exports = { scheduleDailyUpdates, updateUserRecommendations };