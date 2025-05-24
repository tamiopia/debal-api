// routes/guarantor.js
const express = require('express');
const router = express.Router();
const GuarantorController = require('../controllers/GuarantorController');
const upload = require('../middlewares/cloudupload');
const { protect, providerAuth } = require('../middlewares/authMiddleware');

// Create a new guarantor
router.post('/create',protect,upload.fields([
    { name: 'guarantorImage', maxCount: 1 },
    { name: 'verificationCard', maxCount: 1 }
  ])
  , GuarantorController.create);

// Admin verifies a guarantor
router.put('/verify/:id', GuarantorController.verify);

module.exports = router;
