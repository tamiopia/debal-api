const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail, sendPush } = require('../utils/notificationUtils');

// Create and send notification
exports.createNotification = async (req, res) => {
  try {
    const { recipientId, type, content, metadata = {} } = req.body;
    const senderId = req.user.id;

    // 1. Save notification
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      content,
      metadata
    });

    // 2. Deliver based on preferences
    const user = await User.findById(recipientId).select('preferences email');
    
    if (user.preferences.notifications.email) {
      await sendEmail(user.email, 'New Notification', content);
    }

    if (user.preferences.notifications.push) {
      await sendPush(recipientId, content);
    }

    // 3. Emit real-time event
    req.app.get('io').to(`notifications_${recipientId}`).emit('newNotification', notification);

    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user's notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort('-createdAt')
      .limit(20)
      .populate('sender', 'name avatar');
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark as read
exports.markAsRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.sendStatus(204);
};

// Update preferences
exports.updatePreferences = async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { 
    'preferences.notifications': req.body 
  });
  res.sendStatus(200);
};