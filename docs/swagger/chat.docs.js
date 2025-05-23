/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Real-time messaging and conversation management
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Conversation:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "5f8d04b3ab35a642f4b5b3b4"
 *         participants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         lastMessage:
 *           $ref: '#/components/schemas/Message'
 *         participantHash:
 *           type: string
 *           example: "user1_user2"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "5f8d04b3ab35a642f4b5b3b5"
 *         conversation:
 *           type: string
 *           example: "5f8d04b3ab35a642f4b5b3b4"
 *         sender:
 *           $ref: '#/components/schemas/User'
 *         content:
 *           type: string
 *           example: "Hello there!"
 *         messageType:
 *           type: string
 *           enum: [text, media, location]
 *           example: "text"
 *         media:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               example: "/uploads/image.jpg"
 *             mediaType:
 *               type: string
 *               enum: [image, video, document]
 *             size:
 *               type: number
 *               example: 1024
 *         location:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               example: "Point"
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               example: [-73.9857, 40.7484]
 *             name:
 *               type: string
 *               example: "Central Park"
 *             address:
 *               type: string
 *               example: "59th to 110th Street, Manhattan"
 *         read:
 *           type: boolean
 *           example: false
 *         readAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 * 
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "5f8d04b3ab35a642f4b5b3b2"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         avatar:
 *           type: string
 *           example: "/uploads/avatar.jpg"
 *         email:
 *           type: string
 *           example: "john@example.com"
 * 
 *     MessageInput:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *           example: "Hello there!"
 *         messageType:
 *           type: string
 *           enum: [text, media, location]
 *           example: "text"
 *         location:
 *           type: object
 *           properties:
 *             longitude:
 *               type: number
 *               example: -73.9857
 *             latitude:
 *               type: number
 *               example: 40.7484
 *             name:
 *               type: string
 *               example: "Central Park"
 *             address:
 *               type: string
 *               example: "59th to 110th Street, Manhattan"
 * 
 *     ReadStatusInput:
 *       type: object
 *       properties:
 *         messageIds:
 *           type: array
 *           items:
 *             type: string
 *           example: ["5f8d04b3ab35a642f4b5b3b5", "5f8d04b3ab35a642f4b5b3b6"]
 * 
 *     NewConversationInput:
 *       type: object
 *       properties:
 *         participantId:
 *           type: string
 *           example: "5f8d04b3ab35a642f4b5b3b3"
 *       required:
 *         - participantId
 * 
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "Error message"
 *         code:
 *           type: string
 *           example: "ERROR_CODE"
 *         details:
 *           type: string
 *           example: "Additional error details"
 */

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Create a new conversation
 *     description: Create a new conversation between authenticated user and another participant
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewConversationInput'
 *     responses:
 *       201:
 *         description: New conversation created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conversation'
 *       200:
 *         description: Existing conversation found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conversation'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /chat/{conversationId}:
 *   get:
 *     summary: Get conversation messages
 *     description: Retrieve all messages in a conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /chat/{conversationId}/send-message:
 *   post:
 *     summary: Send a message
 *     description: Send a message to a conversation (supports text, media, and location)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               messageType:
 *                 type: string
 *                 enum: [text, media, location]
 *                 example: "text"
 *               content:
 *                 type: string
 *                 example: "Hello there!"
 *               location:
 *                 type: string
 *                 description: JSON string of location data
 *                 example: '{"longitude": -73.9857, "latitude": 40.7484, "name": "Central Park"}'
 *               media:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Invalid message type or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /chat/messages/read:
 *   post:
 *     summary: Mark messages as read
 *     description: Update read status for multiple messages
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReadStatusInput'
 *     responses:
 *       200:
 *         description: Messages marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid message IDs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /chat/users/conversations:
 *   get:
 *     summary: Get all conversations for current user
 *     description: Retrieve all conversations for the authenticated user with last message preview and unread counts
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of conversations to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of user's conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "5f8d04b3ab35a642f4b5b3b4"
 *                       participant:
 *                         $ref: '#/components/schemas/User'
 *                       unreadCount:
 *                         type: integer
 *                         example: 3
 *                       lastMessage:
 *                         $ref: '#/components/schemas/Message'
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 15
 *                     pages:
 *                       type: integer
 *                       example: 2
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     perPage:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */