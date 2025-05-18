const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getMessages,createConversation,sendMessage,markAsRead,getConversations} = require('../controllers/chatController');

router.get('/:conversationId', protect, getMessages);
router.post('/messages/read', protect, markAsRead);
router.post('/', protect, createConversation); // New route
router.get('/:conversationId', protect, getMessages);
router.post('/:conversationId/send-message', protect, sendMessage);
// Add this new route before your other routes
router.get('/users/conversations', protect, getConversations);  // Get all conversations for current user
module.exports = router;