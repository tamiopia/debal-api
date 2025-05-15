const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createNotification,
  getUserNotifications,
  markAsRead,
  updatePreferences
} = require('../controllers/notificationController');

// Create notification (usually called internally by other controllers)
router.post('/', protect, createNotification); 

// User-facing endpoints
router.get('/', protect, getUserNotifications);
router.patch('/:id/read', protect, markAsRead);
router.patch('/preferences', protect, updatePreferences);

module.exports = router;