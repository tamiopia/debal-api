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
//get all guarantors
router.get('/all', GuarantorController.getAll);
//get guarantor by id
router.get('/:id', GuarantorController.getGuarantorById);
//get all guarantors by user id
router.get('/user/:userId', GuarantorController.getGuarantorByUserId);

module.exports = router;
