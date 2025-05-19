const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { protect, providerAuth } = require('../middlewares/authMiddleware');
const {
  createListing,
  searchListings,
  getLocationBasedFeed,
  getMyListings,
  updateListing,
  getListingsFeed
} = require('../controllers/houseListingController');


router.post('/', protect, upload.array('images', 10), createListing);
router.patch('/:id', protect, upload.array('images', 10), updateListing);
router.get('/my-listings', protect,getMyListings);
router.get('/search', searchListings);
// In houseListingRoutes.js
router.get('/feed', getListingsFeed); // Protected but no admin role required

module.exports = router;