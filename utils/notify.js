const Notification = require('../models/Notification');

module.exports = async (io, { recipientId, senderId, type, content, metadata }) => {
  const notification = await Notification.create({
    recipient: recipientId,
    sender: senderId,
    type,
    content,
    metadata
  });

  // Emit real-time event
  io.to(`notifications_${recipientId}`).emit('newNotification', notification);
  
  return notification;
};