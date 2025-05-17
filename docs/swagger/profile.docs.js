/**
 * @swagger
 * tags:
 *   - name: Profiles
 *     description: User profile management and step-by-step completion
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
 *           example: "507f1f77bcf86cd799439011"
 *         user:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         photos:
 *           type: array
 *           items:
 *             type: string
 *           example: ["/uploads/photo1.jpg", "/uploads/photo2.jpg"]
 *         personalInfo:
 *           type: object
 *           properties:
 *             age:
 *               type: number
 *               example: 28
 *             gender:
 *               type: string
 *               enum: [male, female, non-binary, other]
 *         lifestyle:
 *           type: object
 *           properties:
 *             sleepSchedule:
 *               type: string
 *               enum: [early_riser, night_owl, flexible]
 *             smoking:
 *               type: boolean
 *         # Add other profile sections similarly...
 *         isComplete:
 *           type: boolean
 *           description: Marks if profile is 100% completed
 * 
 *     ProfileUpdateResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         nextRecommendedStep:
 *           type: string
 *           example: "financial"
 */

# ======================== Protected Routes ========================

/**
 * @swagger
 * /api/profiles/me:
 *   get:
 *     summary: Get current user's profile
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
 */

/**
 * @swagger
 * /api/profiles/photo:
 *   post:
 *     summary: Upload profile photos
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Photos uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 */

# ==================== Profile Completion Steps ====================

/**
 * @swagger
 * /api/profiles/personal-info:
 *   post:
 *     summary: Save personal information (Step 1)
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *             example:
 *               age: 28
 *               gender: "non-binary"
 *     responses:
 *       200:
 *         description: Personal info saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileUpdateResponse'
 */

/**
 * @swagger
 * /api/profiles/lifestyle:
 *   post:
 *     summary: Save lifestyle preferences (Step 2)
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sleepSchedule:
 *                 type: string
 *               smoking:
 *                 type: boolean
 *             example:
 *               sleepSchedule: "night_owl"
 *               smoking: false
 *     responses:
 *       200:
 *         description: Lifestyle preferences saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileUpdateResponse'
 */

# ... Repeat similar structure for all step endpoints (neighborhood, hobbies, etc.)

/**
 * @swagger
 * /api/profiles/complete:
 *   post:
 *     summary: Mark profile as fully completed
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile marked complete
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 matchBoost:
 *                   type: number
 *                   description: Percentage increase in match visibility
 *                   example: 70
 */

# ======================== Public Routes ========================

/**
 * @swagger
 * /api/profiles:
 *   get:
 *     summary: Get all public profiles (filtered by privacy settings)
 *     tags: [Profiles]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of public profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Profile'
 */

/**
 * @swagger
 * /api/profiles/user/{userId}:
 *   get:
 *     summary: Get public profile by user ID
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       403:
 *         description: Profile is private
 */
/**
 * @swagger
 * tags:
 *   - name: Profile Completion
 *     description: Step-by-step profile completion system
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SharedLiving:
 *       type: object
 *       properties:
 *         cleanliness_level:
 *           type: string
 *           enum: [very_clean, average, messy]
 *           example: "average"
 *         chore_sharing_preference:
 *           type: string
 *           enum: [strict_schedule, flexible, none]
 *           example: "flexible"
 *         noise_tolerance:
 *           type: string
 *           enum: [quiet, moderate, loud]
 *           example: "moderate"
 *         guest_frequency:
 *           type: string
 *           enum: [rarely, sometimes, often]
 *           example: "sometimes"
 *         party_habits:
 *           type: string
 *           enum: [never, occasionally, frequently]
 *           example: "occasionally"
 * 
 *     Pets:
 *       type: object
 *       properties:
 *         has_pets:
 *           type: boolean
 *           example: true
 *         pet_tolerance:
 *           type: string
 *           enum: [none, dogs_only, cats_only, all_pets]
 *           example: "all_pets"
 * 
 *     Food:
 *       type: object
 *       properties:
 *         cooking_frequency:
 *           type: string
 *           enum: [daily, weekly, rarely]
 *           example: "weekly"
 *         diet_type:
 *           type: string
 *           enum: [vegetarian, vegan, omnivore, gluten_free]
 *           example: "omnivore"
 *         shared_groceries:
 *           type: boolean
 *           example: true
 * 
 *     Work:
 *       type: object
 *       properties:
 *         work_hours:
 *           type: string
 *           enum: [9to5, shifts, flexible]
 *           example: "9to5"
 *         works_from_home:
 *           type: boolean
 *           example: true
 *         chronotype:
 *           type: string
 *           enum: [morning_person, night_owl, balanced]
 *           example: "morning_person"
 * 
 *     Privacy:
 *       type: object
 *       properties:
 *         privacy_level:
 *           type: string
 *           enum: [private, shared_spaces, open]
 *           example: "shared_spaces"
 *         shared_space_usage:
 *           type: string
 *           enum: [scheduled, first_come, designated]
 *           example: "first_come"
 */

/**
 * @swagger
 * /api/profiles/shared-living:
 *   post:
 *     summary: Step 6 - Save shared living preferences
 *     tags: [Profile Completion]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SharedLiving'
 *     responses:
 *       200:
 *         description: Shared living preferences saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 nextStep:
 *                   type: string
 *                   example: "/api/profiles/pets"
 *                 completionPercent:
 *                   type: integer
 *                   example: 60
 */

/**
 * @swagger
 * /api/profiles/pets:
 *   post:
 *     summary: Step 7 - Save pet preferences
 *     tags: [Profile Completion]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pets'
 *     responses:
 *       200:
 *         description: Pet preferences saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 nextStep:
 *                   type: string
 *                   example: "/api/profiles/food"
 *                 completionPercent:
 *                   type: integer
 *                   example: 70
 */

/**
 * @swagger
 * /api/profiles/food:
 *   post:
 *     summary: Step 8 - Save food and kitchen preferences
 *     tags: [Profile ]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Food'
 *     responses:
 *       200:
 *         description: Food preferences saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 nextStep:
 *                   type: string
 *                   example: "/api/profiles/work"
 *                 completionPercent:
 *                   type: integer
 *                   example: 80
 */

/**
 * @swagger
 * /api/profiles/work:
 *   post:
 *     summary: Step 9 - Save work and schedule preferences
 *     tags: [Profile Completion]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Work'
 *     responses:
 *       200:
 *         description: Work preferences saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 nextStep:
 *                   type: string
 *                   example: "/api/profiles/privacy"
 *                 completionPercent:
 *                   type: integer
 *                   example: 90
 */

/**
 * @swagger
 * /api/profiles/privacy:
 *   post:
 *     summary: Step 10 - Save privacy preferences
 *     tags: [Profile Completion]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Privacy'
 *     responses:
 *       200:
 *         description: Privacy preferences saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 nextStep:
 *                   type: string
 *                   example: "/api/profiles/complete"
 *                 completionPercent:
 *                   type: integer
 *                   example: 95
 */

/**
 * @swagger
 * /api/profiles/complete:
 *   post:
 *     summary: Step 11 - Mark profile as complete
 *     tags: [Profile Completion]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile completion finalized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 matchBoost:
 *                   type: integer
 *                   description: Percentage increase in match visibility
 *                   example: 70
 *                 unlockedFeatures:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["advanced_search", "message_requests"]
 */



/**
 * @swagger
 * components:
 *   responses:
 *     ProfileError:
 *       description: Error response for profile operations
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: "Invalid pet preference value"
 * 
 *   examples:
 *     SharedLivingExample:
 *       value:
 *         cleanliness_level: "average"
 *         chore_sharing_preference: "flexible"
 *         noise_tolerance: "moderate"
 *         guest_frequency: "sometimes"
 *         party_habits: "occasionally"
 * 
 *     PetsExample:
 *       value:
 *         has_pets: true
 *         pet_tolerance: "all_pets"
 */


/**
 * @swagger
 * /api/profiles/completion-status:
 *   get:
 *     summary: Get profile completion status
 *     tags: [Profile Completion]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns completion progress
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 completedSteps:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["personal-info", "lifestyle", "neighborhood"]
 *                 completionPercent:
 *                   type: integer
 *                   example: 30
 *                 nextRecommendedStep:
 *                   type: string
 *                   example: "hobbies"
 */