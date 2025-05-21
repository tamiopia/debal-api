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
              "compatibility_score": 0.5611107433173305,
              "cluster_id": 3,
              "age": 28,
              "gender": "male",
              "personality_type": "introvert",
              "hobbies": [
                  "reading",
                  "sports",
                  "board games"
              ],
              "user": {
                  "user": {
                      "_id": "682b9b053bc3d778a11d2568",
                      "name": "dawit melese",
                      "email": "dave1@gmail.com",
                      "role": "user",
                      "isOnline": false,
                      "isVerified": false,
                      "isblocked": false,
                      "issuspended": false,
                      "isdeleted": false,
                      "isreported": false
                  },
                  "personalInfo": {
                      "age": 28,
                      "gender": "male",
                      "occupation": "Software Developer",
                      "religion": "christianity",
                      "relationship_status": "single",
                      "social_media_links": {}
                  },
                  "lifestyle": {
                      "personality_type": "extrovert",
                      "daily_routine": "gym before work",
                      "sleep_pattern": "early-bird"
                  },
                  "neighborhoodPrefs": {
                      "preferred_location_type": "urban",
                      "commute_tolerance_minutes": 70
                  },
                  "hobbies": [
                      "reading",
                      "sports",
                      "board games"
                  ],
                  "financial": {
                      "income_level": "75000-100000",
                      "budget_range": {
                          "min": 4000,
                          "max": 6800
                      }
                  },
                  "sharedLiving": {
                      "cleanliness_level": "very-clean",
                      "chore_sharing_preference": "separate",
                      "noise_tolerance": "average",
                      "guest_frequency": "rarely",
                      "party_habits": "rarely"
                  },
                  "pets": {
                      "has_pets": "true",
                      "pet_tolerance": "cats"
                  },
                  "food": {
                      "cooking_frequency": "often",
                      "diet_type": "vegetarian",
                      "shared_groceries": true
                  },
                  "work": {
                      "work_hours": "flexible",
                      "works_from_home": true,
                      "chronotype": "early-bird"
                  },
                  "privacy": {},
                  "photos": [
                      {
                          "url": "uploads\\photos-1747688273925-321817022.jpg",
                          "filename": "photos-1747688273925-321817022.jpg",
                          "mimetype": "image/jpeg",
                          "isProfile": false,
                          "_id": "682b9b523bc3d778a11d256f"
                      },
                      {
                          "url": "uploads\\photos-1747688273931-187920513.jpg",
                          "filename": "photos-1747688273931-187920513.jpg",
                          "mimetype": "image/jpeg",
                          "isProfile": false,
                          "_id": "682b9b523bc3d778a11d2570"
                      },
                      {
                          "url": "uploads\\photos-1747688273945-340032006.jpg",
                          "filename": "photos-1747688273945-340032006.jpg",
                          "mimetype": "image/jpeg",
                          "isProfile": true,
                          "_id": "682b9b523bc3d778a11d2571"
                      },
                      {
                          "url": "uploads\\photos-1747688273957-428793555.jpg",
                          "filename": "photos-1747688273957-428793555.jpg",
                          
                        "mimetype": "image/jpeg",
                        "isProfile": false,
                        "_id": "682b9b523bc3d778a11d2572"
                    },
                    {
                        "url": "uploads\\photos-1747688273965-516052097.jpg",
                        "filename": "photos-1747688273965-516052097.jpg",
                        "mimetype": "image/jpeg",
                        "isProfile": false,
                        "_id": "682b9b523bc3d778a11d2573"
                    }
                ],
                "form_completed": true,
                "recommendationSettings": {
                    "dailyUpdates": true,
                    "minMatchPercentage": 70
                }
            }
        },
        {
            "user_id": "user_682db88246495fc944ab4c38",
            "compatibility_score": 0.4829775293807065,
            "cluster_id": 3,
            "age": 28,
            "gender": "male",
            "personality_type": "ambivert",
            "hobbies": [
                "music",
                "sports",
                "board games"
            ],
            "user": {
                "user": {
                    "_id": "682db88246495fc944ab4c38",
                    "name": "hundesa serbesa",
                    "email": "hundesa@gmail.com",
                    "role": "user",
                    "isOnline": false,
                    "isVerified": false,
                    "isblocked": false,
                    "issuspended": false,
                    "isdeleted": false,
                    "isreported": false
                },
                "personalInfo": {
                    "age": 28,
                    "gender": "male",
                    "occupation": "Software Developer",
                    "religion": "christianity",
                    "relationship_status": "single",
                    "social_media_links": {}
                },
                "lifestyle": {},
                "neighborhoodPrefs": {
                    "preferred_location_type": "urban",
                    "commute_tolerance_minutes": 80
                },
                "hobbies": [
                    "music",
                    "sports",
                    "board games"
                ],
                "financial": {
                    "income_level": "5000-10000",
                    "budget_range": {
                        "min": 2000,
                        "max": 3000
                    }
                },
                "sharedLiving": {
                    "cleanliness_level": "very-clean",
                    "chore_sharing_preference": "separate",
                    "noise_tolerance": "average",
                    "guest_frequency": "rarely",
                    "party_habits": "rarely"
                },
                "pets": {
                    "has_pets": "false",
                    "pet_tolerance": "cats"
                },
                "food": {
                    "cooking_frequency": "often",
                    "diet_type": "vegetarian",
                    "shared_groceries": false
                },
                "work": {
                    "work_hours": "flexible",
                    "works_from_home": false,
                    "chronotype": "early-bird"
                },
                "privacy": {},
                "photos": [],
                "form_completed": true,
                "recommendationSettings": {
                    "dailyUpdates": true,
                    "minMatchPercentage": 70
                }
            }
        }
    ]


  };

  res.json(data);
});
router.put('/recommendation-settings', protect, updateRecommendationSettings);

module.exports = router;