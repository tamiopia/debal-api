const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { 
  getMessages,
  createConversation,
  sendMessage,
  markAsRead,
  getConversations,
  markAsReads
} = require('../controllers/chatController');

// Rate limiting middleware for message-related routes
const { messageLimiter }= require('../middlewares/rateLimiter');

// Conversation routes
router.route('/')
  .post(protect, createConversation) // Create new conversation
  .get(protect, getConversations);  // Get all conversations for current user

// Message routes within a conversation
router.route('/:conversationId/messages')
  .get(protect, getMessages) // Get conversation messages
  .post(protect, messageLimiter, sendMessage); // Send new message

// Message status routes
router.post('/messages/read', protect, markAsReads); // Mark messages as read

module.exports = router;