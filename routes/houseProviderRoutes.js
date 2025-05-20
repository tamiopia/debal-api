const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  registerProvider,
  getProviderProfile
} = require('../controllers/houseProviderController');

console.log({ registerProvider, getProviderProfile });


// Make sure these are properly imported functions
router.post('/register',protect, registerProvider);
router.get('/profile', protect,getProviderProfile);

module.exports = router;