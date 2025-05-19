/**
 * @swagger
 * tags:
 *   name: House Listings
 *   description: Property listing management
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
 *     ListingInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Modern 2-Bedroom Apartment"
 *         description:
 *           type: string
 *           example: "Spacious apartment with great amenities"
 *         bedrooms:
 *           type: integer
 *           example: 2
 *         bathrooms:
 *           type: integer
 *           example: 2
 *         squareFootage:
 *           type: integer
 *           example: 1200
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *               example: "123 Main St"
 *             city:
 *               type: string
 *               example: "New York"
 *             state:
 *               type: string
 *               example: "NY"
 *             zipCode:
 *               type: string
 *               example: "10001"
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               example: [-73.9857, 40.7484]
 *         rent:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *               example: 2500
 *             frequency:
 *               type: string
 *               enum: [monthly, weekly, daily]
 *               example: "monthly"
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *           example: ["parking", "laundry", "gym"]
 *         availableFrom:
 *           type: string
 *           format: date
 *           example: "2025-06-01"
 *         rules:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           example: { "noSmoking": "true", "noPets": "false" }
 *         house_rules:
 *           type: string
 *           description: Mongo ObjectId referencing house rules
 *         photos:
 *           type: array
 *           items:
 *             type: string
 *           example: ["img1.jpg", "img2.jpg"]
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *       required:
 *         - title
 *         - bedrooms
 *         - bathrooms
 *         - address
 *         - rent
 * 
 *     Listing:
 *       allOf:
 *         - $ref: '#/components/schemas/ListingInput'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "5f8d04b3ab35a642f4b5b3b4"
 *             provider:
 *               type: string
 *               example: "5f8d04b3ab35a642f4b5b3b3"
 *             status:
 *               type: string
 *               enum: [available, rented, maintenance]
 *               example: "available"
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
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
 * /listings:
 *   post:
 *     summary: Create a new property listing
 *     description: Create a new property listing (only available to verified providers)
 *     tags: [House Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ListingInput'
 *     responses:
 *       201:
 *         description: Listing created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listing'
 *       403:
 *         description: Forbidden - Only verified providers can create listings
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
 * /listings/search:
 *   get:
 *     summary: Search available property listings
 *     description: Search listings with filters for price, bedrooms, and location
 *     tags: [House Listings]
 *     parameters:
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: bedrooms
 *         schema:
 *           type: integer
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *           example: "-73.9857,40.7484"
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *     responses:
 *       200:
 *         description: List of matching properties
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Listing'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /listings/feed:
 *   get:
 *     summary: Get latest property listings feed
 *     description: Public feed showing all available property listings, ordered by newest first
 *     tags: [House Listings]
 *     responses:
 *       200:
 *         description: Successfully fetched listings feed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 listings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Listing'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /listings/my-listings:
 *   get:
 *     summary: Get my house listings
 *     description: Retrieves all listings created by the currently logged-in provider
 *     tags: [House Listings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched listings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 listings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Listing'
 *       401:
 *         description: Unauthorized
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
 * /listings/{id}:
 *   patch:
 *     summary: Update a house listing
 *     description: Update a house listing by ID. Only the listing owner can perform this action.
 *     tags: [House Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the listing to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ListingInput'
 *     responses:
 *       200:
 *         description: Listing updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listing'
 *       404:
 *         description: Listing not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not your listing
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
