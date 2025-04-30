/**
 * @swagger
 * tags:
 *   name: House Providers
 *   description: Property provider management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProviderInput:
 *       type: object
 *       properties:
 *         companyName:
 *           type: string
 *           example: "Dream Homes Realty"
 *         licenseNumber:
 *           type: string
 *           example: "RE12345678"
 *         contactPhone:
 *           type: string
 *           example: "+1234567890"
 *       required:
 *         - companyName
 *         - licenseNumber
 *         - contactPhone
 * 
 *     Provider:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "5f8d04b3ab35a642f4b5b3b3"
 *         user:
 *           type: string
 *           example: "5f8d04b3ab35a642f4b5b3b2"
 *         companyName:
 *           type: string
 *           example: "Dream Homes Realty"
 *         licenseNumber:
 *           type: string
 *           example: "RE12345678"
 *         contactPhone:
 *           type: string
 *           example: "+1234567890"
 *         properties:
 *           type: array
 *           items:
 *             type: string
 *           example: ["5f8d04b3ab35a642f4b5b3b4"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     ProviderProfile:
 *       allOf:
 *         - $ref: '#/components/schemas/Provider'
 *         - type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   example: "john@example.com"
 *             properties:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Listing'
 */

/**
 * @swagger
 * /providers/register:
 *   post:
 *     summary: Register as a property provider
 *     description: Register a user as a property provider (requires authentication)
 *     tags: [House Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProviderInput'
 *     responses:
 *       201:
 *         description: Successfully registered as provider
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Provider'
 *       400:
 *         description: Bad request (user is already a provider)
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
 * /providers/profile:
 *   get:
 *     summary: Get provider profile
 *     description: Get the authenticated provider's profile with properties
 *     tags: [House Providers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Provider profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProviderProfile'
 *       404:
 *         description: Provider not found
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