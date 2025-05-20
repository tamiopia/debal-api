const { check } = require('express-validator');
const mongoose = require('mongoose');

// Validate MongoDB IDs
exports.validateIds = (ids) => {
  if (!Array.isArray(ids)) ids = [ids];
  return ids.every(id => mongoose.Types.ObjectId.isValid(id));
};

// Conversation creation validator
exports.validateConversation = [
  check('participantId')
    .notEmpty()
    .withMessage('Participant ID is required')
    .custom(id => mongoose.Types.ObjectId.isValid(id))
    .withMessage('Invalid participant ID format')
];

// Message sending validator
exports.validateMessage = [
  check('conversationId')
    .notEmpty()
    .withMessage('Conversation ID is required')
    .custom(id => mongoose.Types.ObjectId.isValid(id))
    .withMessage('Invalid conversation ID format'),
  check('content')
    .if((value, { req }) => req.body.messageType === 'text')
    .notEmpty()
    .withMessage('Message content is required for text messages')
    .isLength({ max: 2000 })
    .withMessage('Message cannot exceed 2000 characters'),
  check('messageType')
    .isIn(['text', 'media', 'location'])
    .withMessage('Invalid message type')
];

// Mark as read validator
exports.validateMarkAsRead = [
  check('messageIds')
    .isArray({ min: 1 })
    .withMessage('At least one message ID is required'),
  check('messageIds.*')
    .custom(id => mongoose.Types.ObjectId.isValid(id))
    .withMessage('Invalid message ID format'),
  check('conversationId')
    .notEmpty()
    .withMessage('Conversation ID is required')
    .custom(id => mongoose.Types.ObjectId.isValid(id))
    .withMessage('Invalid conversation ID format')
];