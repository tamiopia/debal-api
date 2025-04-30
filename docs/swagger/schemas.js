/**
 * @swagger
 * components:
 *   schemas:
 *     ListingInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         bedrooms:
 *           type: number
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 * 
 *     Listing:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         bedrooms:
 *           type: number
 *         images:
 *           type: array
 *           items:
 *             type: string
 */