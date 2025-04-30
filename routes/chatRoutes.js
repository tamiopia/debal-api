const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getMessages,createConversation,sendMessage,markAsRead} = require('../controllers/chatController');

router.get('/:conversationId', protect, getMessages);
router.post('/messages/read', protect, markAsRead);
router.post('/', protect, createConversation); // New route
router.get('/:conversationId', protect, getMessages);
router.post('/:conversationId/messages', protect, sendMessage);

module.exports = router;