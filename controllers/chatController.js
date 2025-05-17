const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const io = require('../sockets/chatSocket');
const upload = require('../middlewares/upload');
const fs = require('fs');
const path = require('path');

// Save message to DB (used by Socket.io)
exports.saveMessage = async (messageData) => {
  const message = await Message.create({
    conversation: messageData.conversationId,
    sender: messageData.senderId,
    content: messageData.content
  });
  return message.populate('sender', 'name avatar');
};

// Create new conversation
exports.createConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user.id; // From auth middleware

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] }
    });

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    // Create new conversation
    const newConversation = await Conversation.create({
      participants: [userId, participantId]
    });

    res.status(201).json(newConversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Enhanced sendMessage with media support
exports.sendMessage = [
  upload.single('media'),
  async (req, res) => {
    try {
      const { conversationId, content, messageType } = req.body;
      const senderId = req.user.id;
        console.log(req.body);
      // Validate message type
      const validTypes = ['text', 'media', 'location'];
      if (!validTypes.includes(messageType)) {
        return res.status(400).json({ error: 'Invalid message type' });
      }

      // Process based on message type
      let messageData = {
        conversation: conversationId,
        sender: senderId,
        messageType
      };

      switch (messageType) {
        case 'text':
          messageData.content = content;
          break;

        case 'media':
          if (!req.file) {
            return res.status(400).json({ error: 'Media file required' });
          }
          messageData.media = {
            url: `/uploads/${req.file.filename}`,
            size: req.file.size
          };
          break;

        case 'location':
          try {
            const location = JSON.parse(req.body.location);
            messageData.location = {
              type: 'Point',
              coordinates: [location.longitude, location.latitude],
              name: location.name || null,
              address: location.address || null
            };
          } catch (err) {
            return res.status(400).json({ error: 'Invalid location data' });
          }
          break;
      }
        console.log(messageData)

      const message = await Message.create(messageData);
      res.status(201).json(message);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

// Helper to get signed URLs (for secure cloud storage)
const getSignedUrl = (filePath) => {
  // Implement based on your storage (AWS S3, Google Cloud, etc.)
  return filePath; // Return direct URL for local storage
};
exports.markAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user.id;

    // Validate user is part of these conversations
    const messages = await Message.find({
      _id: { $in: messageIds },
      sender: { $ne: userId } // Can't mark own messages as read
    }).populate('conversation');

    const validMessages = messages.filter(msg => 
      msg.conversation.participants.includes(userId)
    );

    // Update read status
    await Message.updateMany(
      { _id: { $in: validMessages.map(m => m._id) } },
      { $set: { read: true, readAt: Date.now() } }
    );

    // Real-time update
    const io = req.app.get('io');
    validMessages.forEach(msg => {
      io.to(msg.conversation._id.toString()).emit('messageRead', {
        messageId: msg._id,
        readAt: new Date()
      });
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get conversation history
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId
    }).populate('sender', 'name avatar');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all conversations for current user with last message preview
// Get all conversations for current user with last message preview
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all conversations for the user
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate({
      path: 'participants',
      select: 'name avatar email'
    })
    .populate({
      path: 'lastMessage',
      select: 'content sender createdAt read'
    })
    .sort({ updatedAt: -1 }); // Sort by most recent

    // Get unread counts for all conversations in parallel
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: userId },
          read: false
        });
        
        const otherParticipant = conv.participants.find(
          p => p._id.toString() !== userId.toString()
        );
        
        return {
          _id: conv._id,
          participant: otherParticipant,
          unreadCount,
          lastMessage: conv.lastMessage,
          updatedAt: conv.updatedAt
        };
      })
    );

    res.json(conversationsWithUnread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};