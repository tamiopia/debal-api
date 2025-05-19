const express = require('express');
const router = express.Router();

const {
  getMyProfile,
  createOrUpdateProfile,
  getAllProfiles,
  getProfileByUserId,
  savePersonalInfo,
  saveLifestyle,
  saveNeighborhoodPreferences,
  saveHobbies,
  saveFinancial,
  saveSharedLiving,
  savePets,
  saveFood,
  saveWork,
  savePrivacy,
  markFormCompleted,
  getRecommendations,
  updateRecommendationSettings,
  setProfilePhoto,
  deletePhoto,
  

} = require('../controllers/profileController');

const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload'); 

// ✅ Protected routes
router.get('/me', protect, getMyProfile);
router.post('/photo', protect,upload.array('photos', 5), createOrUpdateProfile);
router.patch('/profile/photo/set-profile/:filename', protect, setProfilePhoto);
router.delete('/profile/photo/:filename', protect, deletePhoto);



// ✅ Step-wise protected profile completion
router.post("/personal-info", protect, savePersonalInfo);
router.post("/lifestyle", protect, saveLifestyle);
router.post("/neighborhood", protect, saveNeighborhoodPreferences);
router.post("/hobbies", protect, saveHobbies);
router.post("/financial", protect, saveFinancial);
router.post("/shared-living", protect, saveSharedLiving);
router.post("/pets", protect, savePets);
router.post("/food", protect, saveFood);
router.post("/work", protect, saveWork);
router.post("/privacy", protect, savePrivacy);
router.post("/complete", protect, markFormCompleted);
router.get("/recommendations", protect, getRecommendations);


// ✅ Public routes
router.get('/', getAllProfiles);
router.get('/user/:userId', getProfileByUserId);

module.exports = router;
