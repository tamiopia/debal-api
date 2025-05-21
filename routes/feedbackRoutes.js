const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/',protect, feedbackController.submitFeedback);
router.post('/report',protect, feedbackController.reportUser);

module.exports = router;
