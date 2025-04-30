/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: User matching and compatibility system
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
 *     Match:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *           example: "5f8d04b3ab35a642f4b5b3b3"
 *         score:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           example: 85
 *         profile:
 *           $ref: '#/components/schemas/Profile'
 * 
 *     Profile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "5f8d04b3ab35a642f4b5b3b4"
 *         user:
 *           type: string
 *           example: "5f8d04b3ab35a642f4b5b3b3"
 *         bio:
 *           type: string
 *           example: "Easy-going professional looking for compatible roommate"
 *         occupation:
 *           type: string
 *           example: "Software Engineer"
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *           example: ["hiking", "reading", "cooking"]
 *         lifestylePhoto:
 *           type: string
 *           example: "/uploads/lifestyle.jpg"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     Preference:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "5f8d04b3ab35a642f4b5b3b5"
 *         user:
 *           type: string
 *           example: "5f8d04b3ab35a642f4b5b3b3"
 *         cleanliness:
 *           type: string
 *           enum: [neat, average, messy]
 *           example: "neat"
 *         sleepSchedule:
 *           type: string
 *           enum: [early, flexible, nightowl]
 *           example: "early"
 *         smoking:
 *           type: string
 *           enum: [never, sometimes, regularly]
 *           example: "never"
 *         pets:
 *           type: string
 *           enum: [none, cats, dogs, any]
 *           example: "dogs"
 *         budgetMin:
 *           type: number
 *           example: 800
 *         budgetMax:
 *           type: number
 *           example: 1200
 *         locationPreference:
 *           type: object
 *           properties:
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               example: [-73.9857, 40.7484]
 *             maxDistance:
 *               type: number
 *               example: 5
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Error message"
 */

/**
 * @swagger
 * /matches:
 *   get:
 *     summary: Get compatible matches
 *     description: Retrieve a list of compatible users based on preferences (minimum 60% compatibility score)
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of compatible matches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Match'
 *         headers:
 *           X-Total-Count:
 *             schema:
 *               type: integer
 *             description: Total number of matches found
 *       400:
 *         description: Bad request (user preferences not set)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /matches/score-details:
 *   get:
 *     summary: Get compatibility score breakdown
 *     description: Get detailed information about how compatibility scores are calculated
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: Score calculation details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lifestyleWeights:
 *                   type: object
 *                   properties:
 *                     cleanliness:
 *                       type: number
 *                       example: 0.3
 *                     sleepSchedule:
 *                       type: number
 *                       example: 0.2
 *                     smoking:
 *                       type: number
 *                       example: 0.25
 *                     pets:
 *                       type: number
 *                       example: 0.25
 *                 locationWeight:
 *                   type: number
 *                   example: 0.3
 *                 budgetWeight:
 *                   type: number
 *                   example: 0.2
 *                 minimumThreshold:
 *                   type: integer
 *                   example: 60
 */