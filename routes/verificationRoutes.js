const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect,admin,superadmin } = require("../middlewares/authMiddleware");
const {
  submitVerification,
  getVerificationRequests,
  updateVerificationStatus
} = require('../controllers/verificationController');

// Upload config
const storage = multer.diskStorage({
  destination: 'uploads/verification/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// User submits verification
router.post('/', protect, admin, upload.single('documentImage'), submitVerification);

// Admin routes
router.get('/admin/requests', protect,  getVerificationRequests);
router.patch('/admin/:id/status', protect,  updateVerificationStatus);

module.exports = router;
