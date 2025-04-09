const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  createOrUpdateProfile,
  getAllProfiles,
  getProfileByUserId
} = require('../controllers/profileController');
const { protect } = require('../middlewares/authMiddleware');

// Protected routes
router.get('/me', protect, getMyProfile);
router.post('/', protect, createOrUpdateProfile);

// Public routes
router.get('/', getAllProfiles);
router.get('/user/:userId', getProfileByUserId);

module.exports = router;