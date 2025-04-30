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
 *           required:
 *             - _id
 *             - provider
 *             - status
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
 *         description: Minimum rent amount
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum rent amount
 *       - in: query
 *         name: bedrooms
 *         schema:
 *           type: integer
 *         description: Minimum number of bedrooms
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Comma-separated longitude,latitude coordinates (e.g., "-73.9857,40.7484")
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *         description: Search radius in miles from location (default 10 miles)
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