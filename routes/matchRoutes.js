const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getMatches } = require('../controllers/matchController');
const {
    
    
    updateRecommendationSettings
  
  } = require('../controllers/profileController');

  const {getRecommendations}=require('../controllers/recomandationController');

router.get('/', protect, getMatches);
router.get('/recommendations', (req, res) => {
  const data = {
    "recommendations": [
      {
        "user_id": "user_682b9b053bc3d778a11d2568",
        "compatibility_score": 0.6427906187135428,
        "cluster_id": 2,
        "age": 28,
        "gender": "male",
        "personality_type": "introvert",
        "hobbies": ["reading", "sports", "board games"],
        "user_details": {
          "id": "682b9b053bc3d778a11d2568",
          "name": "Dawit Melese",
          "email": "dave1@gmail.com"
        }
      },
      {
        "user_id": "user_682db88246495fc944ab4c38",
        "compatibility_score": 0.36297818465991655,
        "cluster_id": 6,
        "age": 28,
        "gender": "male",
        "personality_type": "ambivert",
        "hobbies": ["music", "sports", "board games"],
        "user_details": {
          "id": "682db88246495fc944ab4c38",
          "name": "Hundesa Serbesa",
          "email": "hundesa@gmail.com"
        }
      },
      {
        "user_id": "user_682fa76310c5d0296a0fbb71",
        "compatibility_score": 0.48963271598732514,
        "cluster_id": 2,
        "age": 26,
        "gender": "female",
        "personality_type": "extrovert",
        "hobbies": ["dancing", "cooking", "traveling"],
        "user_details": {
          "id": "682fa76310c5d0296a0fbb71",
          "name": "Selam Fikru",
          "email": "selamfikru@gmail.com"
        }
      }
    ],
    "cluster_info": {
      "cluster_id": 1
    },
    "model_metrics": {
      "silhouette_score": 0.0779491539886163,
      "cluster_description": {
        "size": 28,
        "avg_age": 30.4,
        "gender_distribution": {
          "male": 11,
          "female": 3,
          "non-binary": 9,
          "prefer-not-to-say": 5
        },
        "common_personality": "ambivert",
        "common_sleep": "night-owl",
        "top_hobbies": {
          "cooking": 12,
          "sports": 11,
          "movies": 11
        },
        "cleanliness_profile": "average"
      }
    }
  };

  res.json(data);
});
router.put('/recommendation-settings', protect, updateRecommendationSettings);

module.exports = router;