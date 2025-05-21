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
  getListingsFeed,
  getListingById,
  getalllistings,
  DeleteListing,
  filterlistings,
  updateimages,
  uploadimages,
  deleteImage
} = require('../controllers/houseListingController');


router.post('/', protect, upload.array('images', 10), createListing);
router.patch('/:id', protect, upload.array('images', 10), updateListing);
router.post('/images/:listingId', protect, upload.array('images', 10), uploadimages);
router.patch('/images/:listingId', protect, upload.array('images', 10), updateimages);
router.delete('/images/:listingId/:imageId', protect, upload.array('images', 10), deleteImage);
router.get('/:id', protect, getListingById);
router.delete('/:id', protect, DeleteListing);
router.get('/', protect,getMyListings);
router.get('/filter/lists', protect, filterlistings);
router.get('/search', searchListings);
router.get('/all/get',protect,getalllistings);
// In houseListingRoutes.js
router.get('/get/feed', getListingsFeed); // Protected but no admin role required

module.exports = router;