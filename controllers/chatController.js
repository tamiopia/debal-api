// const Conversation = require('../models/Conversation');
// const Message = require('../models/Message');
// const io = require('../sockets/chatSocket');
// const upload = require('../middlewares/upload');
// const fs = require('fs');
// const path = require('path');
// const mongoose = require('mongoose');
// const User = require("../models/User");

// // Save message to DB (used by Socket.io)
// exports.saveMessage = async (messageData) => {
//   const message = await Message.create({
//     conversation: messageData.conversationId,
//     sender: messageData.senderId,
//     content: messageData.content
//   });
//   return message.populate('sender', 'name avatar');
// };

// // Create new conversation
// exports.createConversation = async (req, res) => {
//   try {
//     const { participantId } = req.body;
//     const userId = req.user.id;

//     // Input validation
//     if (!participantId || !mongoose.Types.ObjectId.isValid(participantId)) {
//       return res.status(400).json({ 
//         success: false,
//         error: "Invalid participant ID",
//         code: "INVALID_PARTICIPANT"
//       });
//     }

//     if (participantId === userId.toString()) {
//       return res.status(400).json({
//         success: false,
//         error: "Cannot create conversation with yourself",
//         code: "SELF_CONVERSATION"
//       });
//     }

//     // Create sorted participant array
//     const participants = [userId, participantId]
//       .map(id => new mongoose.Types.ObjectId(id))
//       .sort((a, b) => a.toString().localeCompare(b.toString()));

//     // Generate the participant hash
//     const participantHash = participants.map(id => id.toString()).sort().join('_');

//     // Check for existing conversation using participantHash
//     const existingConversation = await Conversation.findOne({ participantHash })
//       .populate('participants', 'name avatar email');

//     if (existingConversation) {
//       return res.status(200).json({
//         success: true,
//         data: existingConversation,
//         isNew: false,
//         message: "Existing conversation found"
//       });
//     }

//     // Verify participant exists
//     const participantExists = await User.exists({ _id: participantId });
//     if (!participantExists) {
//       return res.status(404).json({
//         success: false,
//         error: "Participant user not found",
//         code: "PARTICIPANT_NOT_FOUND"
//       });
//     }

//     // Create new conversation
//     const newConversation = await Conversation.create({ 
//       participants,
//       participantHash // Include the hash
//     });
    
//     const populated = await Conversation.populate(newConversation, {
//       path: 'participants',
//       select: 'name avatar email'
//     });

//     return res.status(201).json({
//       success: true,
//       data: populated,
//       isNew: true,
//       message: "Conversation created successfully"
//     });

//   } catch (err) {
//     console.error("Error creating conversation:", err);
    
//     if (err.code === 11000) {
//       return res.status(409).json({
//         success: false,
//         error: "Conversation already exists between these users",
//         code: "CONVERSATION_EXISTS"
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: "Internal server error",
//       code: "SERVER_ERROR",
//       details: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };



// // Enhanced sendMessage with media support
// exports.sendMessage = [
//   upload.single('media'),
//   async (req, res) => {
//     try {
//       const { conversationId, content, messageType } = req.body;
//       const senderId = req.user.id;

//       // Validate conversation exists and user is a participant
//       const conversation = await Conversation.findOne({
//         _id: conversationId,
//         participants: senderId
//       });

//       if (!conversation) {
//         return res.status(404).json({ 
//           success: false,
//           error: "Conversation not found or access denied",
//           code: "INVALID_CONVERSATION"
//         });
//       }

//       // Validate message type
//       const validTypes = ['text', 'media', 'location'];
//       if (!validTypes.includes(messageType)) {
//         return res.status(400).json({ 
//           success: false,
//           error: 'Invalid message type',
//           code: "INVALID_MESSAGE_TYPE"
//         });
//       }

//       // Process based on message type
//       let messageData = {
//         conversation: conversationId,
//         sender: senderId,
//         messageType
//       };

//       switch (messageType) {
//         case 'text':
//           if (!content || typeof content !== 'string') {
//             return res.status(400).json({
//               success: false,
//               error: 'Text content is required',
//               code: "MISSING_CONTENT"
//             });
//           }
//           messageData.content = content;
//           break;

//         case 'media':
//           if (!req.file) {
//             return res.status(400).json({
//               success: false,
//               error: 'Media file required',
//               code: "MISSING_MEDIA"
//             });
//           }
//           messageData.media = {
//             url: `/uploads/${req.file.filename}`,
//             mediaType: req.file.mimetype.split('/')[0], // 'image', 'video', etc.
//             size: req.file.size
//           };
//           break;

//         case 'location':
//           try {
//             const location = JSON.parse(req.body.location);
//             if (!location.longitude || !location.latitude) {
//               throw new Error('Missing coordinates');
//             }
//             messageData.location = {
//               type: 'Point',
//               coordinates: [location.longitude, location.latitude],
//               name: location.name || null,
//               address: location.address || null
//             };
//           } catch (err) {
//             return res.status(400).json({
//               success: false,
//               error: 'Invalid location data',
//               code: "INVALID_LOCATION",
//               details: err.message
//             });
//           }
//           break;
//       }

//       // Create and save message
//       const message = await Message.create(messageData);
      
//       // Update conversation's last message
//       await Conversation.findByIdAndUpdate(
//         conversationId,
//         { lastMessage: message._id }
//       );

//       // Populate sender info in response
//       const populatedMessage = await Message.populate(message, {
//         path: 'sender',
//         select: 'name avatar'
//       });

//       res.status(201).json({
//         success: true,
//         data: populatedMessage
//       });

//     } catch (err) {
//       console.error("Error sending message:", err);
      
//       if (err.name === 'CastError') {
//         return res.status(400).json({
//           success: false,
//           error: "Invalid ID format",
//           code: "INVALID_ID_FORMAT"
//         });
//       }

//       res.status(500).json({
//         success: false,
//         error: "Failed to send message",
//         code: "SERVER_ERROR",
//         details: process.env.NODE_ENV === 'development' ? err.message : undefined
//       });
//     }
//   }
// ];

// // Helper to get signed URLs (for secure cloud storage)
// const getSignedUrl = (filePath) => {
//   // Implement based on your storage (AWS S3, Google Cloud, etc.)
//   return filePath; // Return direct URL for local storage
// };
// exports.markAsRead = async (req, res) => {
//   try {
//     const { messageIds } = req.body;
//     const userId = req.user.id;

//     // Validate user is part of these conversations
//     const messages = await Message.find({
//       _id: { $in: messageIds },
//       sender: { $ne: userId } // Can't mark own messages as read
//     }).populate('conversation');

//     const validMessages = messages.filter(msg => 
//       msg.conversation.participants.includes(userId)
//     );

//     // Update read status
//     await Message.updateMany(
//       { _id: { $in: validMessages.map(m => m._id) } },
//       { $set: { read: true, readAt: Date.now() } }
//     );

//     // Real-time update
//     const io = req.app.get('io');
//     validMessages.forEach(msg => {
//       io.to(msg.conversation._id.toString()).emit('messageRead', {
//         messageId: msg._id,
//         readAt: new Date()
//       });
//     });

//     res.status(200).json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get conversation history
// exports.getMessages = async (req, res) => {
//   try {
//     const messages = await Message.find({
//       conversation: req.params.conversationId
//     })
//       .populate('sender', 'name avatar')
//       .sort({ createdAt: 1 }); // ✅ sort by timestamp (oldest first)

//     res.json(messages);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // Get all conversations for current user with last message preview
// // Get all conversations for current user with last message preview
// exports.getConversations = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // Validate user ID
//     if (!mongoose.isValidObjectId(userId)) {
//       return res.status(400).json({ 
//         success: false,
//         error: "Invalid user ID format",
//         code: "INVALID_ID"
//       });
//     }

//     const conversations = await Conversation.aggregate([
//       { $match: { participants: new mongoose.Types.ObjectId(userId) } },
//       { $sort: { updatedAt: -1 } },
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'participants',
//           foreignField: '_id',
//           as: 'participants',
//           pipeline: [{ $project: { name: 1, avatar: 1, email: 1 } }]
//         }
//       },
//       {
//         $lookup: {
//           from: 'messages',
//           let: { convId: '$_id' },
//           pipeline: [
//             { $match: { $expr: { $eq: ['$conversation', '$$convId'] } } },
//             { $sort: { createdAt: -1 } },
//             { $limit: 1 },
//             { $project: { content: 1, sender: 1, createdAt: 1, read: 1 } }
//           ],
//           as: 'lastMessage'
//         }
//       },
//       { $unwind: { path: '$lastMessage', preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: 'messages',
//           let: { convId: '$_id', userId: new mongoose.Types.ObjectId(userId) },
//           pipeline: [
//             { 
//               $match: { 
//                 $expr: { 
//                   $and: [
//                     { $eq: ['$conversation', '$$convId'] },
//                     { $ne: ['$sender', '$$userId'] },
//                     { $eq: ['$read', false] }
//                   ]
//                 }
//               }
//             },
//             { $count: 'count' }
//           ],
//           as: 'unread'
//         }
//       },
//       {
//         $addFields: {
//           unreadCount: { $ifNull: [{ $arrayElemAt: ['$unread.count', 0] }, 0] },
//           participant: {
//             $arrayElemAt: [
//               { $filter: {
//                 input: '$participants',
//                 as: 'participant',
//                 cond: { $ne: ['$$participant._id', new mongoose.Types.ObjectId(userId)] }
//               }},
//               0
//             ]
//           }
//         }
//       },
//       {
//         $project: {
//           _id: 1,
//           participant: 1,
//           lastMessage: 1,
//           unreadCount: 1,
//           updatedAt: 1
//         }
//       }
//     ]);

//     res.json({
//       success: true,
//       data: conversations
//     });

//   } catch (err) {
//     console.error('Conversation fetch error:', err);
    
//     if (err.name === 'CastError') {
//       return res.status(400).json({
//         success: false,
//         error: `Invalid ID format at ${err.path}`,
//         code: "INVALID_ID_FORMAT"
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch conversations",
//       code: "SERVER_ERROR",
//       details: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { 
  validateIds,
  validateConversation,
  validateMessage,
  validateMarkAsRead 
} = require('../utils/validators');
const { sanitize } = require('../utils/sanitizers');

// Maximum messages to load at once
const MESSAGE_PAGE_SIZE = 50;

// Initialize with Socket.io
let ioInstance = null;

function initializeChat(io) {
  ioInstance = io;
}

// Save message to database
async function saveMessage(messageData) {
  const message = await Message.create({
    conversation: messageData.conversationId,
    sender: messageData.senderId,
    content: sanitize(messageData.content),
    messageType: messageData.messageType,
    media: messageData.media,
    location: messageData.location
  });
  
  return message.populate('sender', 'name avatar');
}

// Create new conversation
async function createConversation(req, res) {
  try {
    const { participantId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!validateIds([participantId, userId])) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid ID format",
        code: "INVALID_ID"
      });
    }

    if (participantId === userId) {
      return res.status(400).json({
        success: false,
        error: "Cannot create conversation with yourself",
        code: "SELF_CONVERSATION"
      });
    }

    // Check for existing conversation
    const participants = [userId, participantId].sort();
    const participantHash = participants.join('_');

    const existing = await Conversation.findOne({ participantHash })
      .populate('participants', 'name avatar');
    
    if (existing) {
      return res.json({
        success: true,
        data: existing,
        isNew: false
      });
    }

    // Verify participant exists
    const participantExists = await User.exists({ _id: participantId });
    if (!participantExists) {
      return res.status(404).json({
        success: false,
        error: "Participant not found",
        code: "USER_NOT_FOUND"
      });
    }

    // Create new conversation
    const conversation = await Conversation.create({
      participants,
      participantHash
    });

    // Notify participants
    if (ioInstance) {
      ioInstance.to(userId).emit('conversation:new', conversation);
      ioInstance.to(participantId).emit('conversation:new', conversation);
    }

    res.status(201).json({
      success: true,
      data: await conversation.populate('participants', 'name avatar'),
      isNew: true
    });

  } catch (error) {
    console.error('Conversation error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "SERVER_ERROR"
    });
  }
}

// Send message with real-time delivery
const socket = require('../sockets/chatSocket'); // Ensure this provides access to ioInstance

async function sendMessage(req, res) {
  try {
    const { conversationId, content, messageType } = req.body;
    const senderId = req.user.id;

    // Validate conversation access
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: senderId
    });

    if (!conversation) {
      return res.status(403).json({ 
        success: false,
        error: "Conversation not found or access denied",
        code: "CONVERSATION_NOT_FOUND"
      });
    }

    // Prepare message data
    const messageData = {
      conversationId,
      senderId,
      content,
      messageType: ['text', 'media', 'location'].includes(messageType) 
        ? messageType 
        : 'text'
    };

    // Handle media uploads
    if (messageType === 'media' && req.file) {
      messageData.media = {
        url: `/uploads/${req.file.filename}`,
        type: req.file.mimetype.split('/')[0],
        size: req.file.size
      };
    }

    // Handle location data
    if (messageType === 'location') {
      try {
        messageData.location = JSON.parse(req.body.location);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: "Invalid location data",
          code: "INVALID_LOCATION"
        });
      }
    }

    // Save and broadcast message
    const message = await saveMessage(messageData);
    await Conversation.updateOne(
      { _id: conversationId },
      { lastMessage: message._id, updatedAt: new Date() }
    );

    // Broadcast to conversation room
    if (socket.ioInstance) {
      // Send to all users in the conversation room
      socket.ioInstance.to(`conversation_${conversationId}`).emit('message:new', {
        ...message.toObject()
      });

      // Send a notification to recipient user
      const recipient = conversation.participants.find(p => p.toString() !== senderId);
      if (recipient) {
        socket.ioInstance.to(`user_${recipient}`).emit('message:notification', {
          conversationId,
          sender: req.user.username,
          preview: content.substring(0, 30),
          createdAt: new Date()
        });
      }
    }

    // Send response
    res.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Message error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to send message",
      code: "SERVER_ERROR"
    });
  }
}


// Get conversation messages with pagination
async function getMessages(req, res) {
  try {
    const { conversationId } = req.params;
    const { before } = req.query; // For pagination

    const query = { conversation: conversationId };
    if (before) query.createdAt = { $lt: new Date(before) };

    const messages = await Message.find(query)
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(MESSAGE_PAGE_SIZE);

    res.json({
      success: true,
      data: messages.reverse() // Return oldest first
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch messages",
      code: "SERVER_ERROR"
    });
  }
}

// Mark messages as read
async function markAsRead(req, res) {
  try {
    const { messageIds, conversationId } = req.body;
    const userId = req.user.id;

    await Message.updateMany(
      { 
        _id: { $in: messageIds },
        conversation: conversationId,
        sender: { $ne: userId } // Can't mark own messages as read
      },
      { $set: { read: true, readAt: new Date() } }
    );

    if (ioInstance) {
      ioInstance.to(conversationId).emit('messages:read', {
        messageIds,
        readBy: userId,
        readAt: new Date()
      });
    }

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to mark messages as read",
      code: "SERVER_ERROR"
    });
  }
}

// Get user conversations with preview
async function getConversations(req, res) {
  try {
    const conversations = await Conversation.aggregate([
      { $match: { participants: req.user._id } },
      { $sort: { updatedAt: -1 } },
      {
        $lookup: {
          from: 'messages',
          let: { convId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$conversation', '$$convId'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 }
          ],
          as: 'lastMessage'
        }
      },
      { $unwind: { path: '$lastMessage', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'participants',
          foreignField: '_id',
          as: 'participants',
          pipeline: [{ $project: { name: 1, avatar: 1 } }]
        }
      }
    ]);

    res.json({
      success: true,
      data: conversations.map(conv => ({
        ...conv,
        otherParticipant: conv.participants.find(p => !p._id.equals(req.user._id))
      }))
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch conversations",
      code: "SERVER_ERROR"
    });
  }
}

module.exports = {
  initializeChat,
  saveMessage,
  createConversation,
  sendMessage,
  getMessages,
  markAsRead,
  getConversations
};