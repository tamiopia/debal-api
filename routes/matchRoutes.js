const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getMatches } = require('../controllers/matchController');
const {
    
    getRecommendations,
    updateRecommendationSettings
  
  } = require('../controllers/profileController');

router.get('/', protect, getMatches);
router.get('/recommendations', protect, getRecommendations);
router.put('/recommendation-settings', protect, updateRecommendationSettings);

module.exports = router;