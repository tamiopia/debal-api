/**
 * @swagger
 * tags:
 *   name: Profiles
 *   description: User profile management
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
 *     Profile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "5f8d04b3ab35a642f4b5b3b4"
 *         user:
 *           $ref: '#/components/schemas/User'
 *         age:
 *           type: integer
 *           minimum: 18
 *           maximum: 100
 *           example: 28
 *         gender:
 *           type: string
 *           enum: [male, female, other, prefer-not-to-say]
 *           example: "male"
 *         bio:
 *           type: string
 *           example: "Software engineer who loves hiking and cooking"
 *         photos:
 *           type: array
 *           items:
 *             type: string
 *           example: ["/uploads/photo1.jpg", "/uploads/photo2.jpg"]
 *         location:
 *           type: object
 *           properties:
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               example: [-73.9857, 40.7484]
 *             address:
 *               type: string
 *               example: "123 Main St, New York, NY"
 *         occupation:
 *           type: string
 *           example: "Software Engineer"
 *         lifestyle:
 *           type: object
 *           properties:
 *             cleanliness:
 *               type: string
 *               enum: [neat, average, messy]
 *               example: "neat"
 *             sleepSchedule:
 *               type: string
 *               enum: [early, flexible, nightowl]
 *               example: "early"
 *             smoking:
 *               type: boolean
 *               example: false
 *             pets:
 *               type: boolean
 *               example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
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
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         avatar:
 *           type: string
 *           example: "/uploads/avatar.jpg"
 * 
 *     ProfileInput:
 *       type: object
 *       properties:
 *         age:
 *           type: integer
 *           example: 28
 *         gender:
 *           type: string
 *           example: "male"
 *         bio:
 *           type: string
 *           example: "Software engineer who loves hiking and cooking"
 *         photos:
 *           type: array
 *           items:
 *             type: string
 *           example: ["/uploads/photo1.jpg", "/uploads/photo2.jpg"]
 *         location:
 *           type: object
 *           properties:
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               example: [-73.9857, 40.7484]
 *             address:
 *               type: string
 *               example: "123 Main St, New York, NY"
 *         occupation:
 *           type: string
 *           example: "Software Engineer"
 *         lifestyle:
 *           type: object
 *           properties:
 *             cleanliness:
 *               type: string
 *               example: "neat"
 *             sleepSchedule:
 *               type: string
 *               example: "early"
 *             smoking:
 *               type: boolean
 *               example: false
 *             pets:
 *               type: boolean
 *               example: true
 * 
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Profile not found"
 */

/**
 * @swagger
 * /profiles/me:
 *   get:
 *     summary: Get current user's profile
 *     description: Retrieve the authenticated user's profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /profiles:
 *   post:
 *     summary: Create or update profile
 *     description: Create or update the authenticated user's profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileInput'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /profiles:
 *   get:
 *     summary: Get all profiles
 *     description: Retrieve a list of all user profiles (public)
 *     tags: [Profiles]
 *     responses:
 *       200:
 *         description: List of profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Profile'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /profiles/user/{userId}:
 *   get:
 *     summary: Get profile by user ID
 *     description: Retrieve a specific user's profile by their ID (public)
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */