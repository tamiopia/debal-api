const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { protect, providerAuth } = require('../middlewares/authMiddleware');
const {
  createListing,
  searchListings,
  getLocationBasedFeed
} = require('../controllers/houseListingController');

router.post('/', protect, providerAuth, upload.array('images', 10), createListing);
router.get('/search', searchListings);
// In houseListingRoutes.js
router.get("/feed", protect, getLocationBasedFeed); // Protected but no admin role required

module.exports = router;