const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect,admin} = require("../middlewares/authMiddleware");
const {
  submitVerification,
  getVerificationRequests,
  updateVerificationStatus,
  getVerificationRequestsbyid
} = require('../controllers/verificationController');

// Upload config
const storage = multer.diskStorage({
  destination: 'uploads/verification/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = require('../middlewares/cloudupload');

// User submits verification
// Here, we expect two images (front and back) and other form fields (idType, idNumber, fullName)
router.post('/', protect, upload.fields([
  { name: 'frontIdImage', maxCount: 1 },  // Handle front image
  { name: 'backIdImage', maxCount: 1 }    // Handle back image
]), submitVerification);

// Admin routes
router.get('/admin/requests', protect,admin, getVerificationRequests);
router.get('/admin/requests/:id', protect,admin, getVerificationRequestsbyid);
router.patch('/admin/requests/:id', protect,admin, updateVerificationStatus);

module.exports = router;
