/**
 * @swagger
 * tags:
 *   name: Verification
 *   description: User identity verification using National ID or Passport
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     VerificationRequest:
 *       type: object
 *       properties:
 *         id_type:
 *           type: string
 *           enum: [national_id, passport]
 *           example: "national_id"
 *         id_number:
 *           type: string
 *           example: "12345678901234"
 *         full_name:
 *           type: string
 *           example: "John Doe"
 *         front_image:
 *           type: string
 *           format: binary
 *         back_image:
 *           type: string
 *           format: binary
 *       required:
 *         - id_type
 *         - id_number
 *         - full_name
 *         - front_image

 *     VerificationStatus:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           example: "pending"
 *         reason:
 *           type: string
 *           example: "Image is blurry or ID is invalid"

 *     VerificationResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "609c5ec5c25e4f1b5c123456"
 *         user_id:
 *           type: string
 *           example: "609c5ec5c25e4f1b5c654321"
 *         id_type:
 *           type: string
 *           example: "national_id"
 *         status:
 *           type: string
 *           example: "pending"
 *         submitted_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /verification/submit:
 *   post:
 *     summary: Submit ID for verification
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/VerificationRequest'
 *     responses:
 *       201:
 *         description: Verification submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerificationResponse'
 *       400:
 *         description: Bad request (missing or invalid fields)
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /verification/status:
 *   get:
 *     summary: Get user's verification status
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerificationStatus'
 *       401:
 *         description: Unauthorized (invalid token)
 *       404:
 *         description: No verification record found
 *       500:
 *         description: Internal server error
 */
