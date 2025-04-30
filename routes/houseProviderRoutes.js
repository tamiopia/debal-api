const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  registerProvider,
  getProviderProfile
} = require('../controllers/houseProviderController');

console.log({ registerProvider, getProviderProfile });

// Make sure these are properly imported functions
router.post('/register', registerProvider);
router.get('/profile', getProviderProfile);

module.exports = router;