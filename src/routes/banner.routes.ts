import express from "express"
import {
  getActiveBanners,
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/banner.controller"
import { authenticate, authorize } from "../middlewares/auth.middleware"
import { body } from "express-validator"
import { validate } from "../middlewares/validation.middleware"

const router = express.Router()

/**
 * @swagger
 * /api/banners:
 *   get:
 *     summary: Get all active banners
 *     tags: [Banners]
 *     responses:
 *       200:
 *         description: List of active banners
 */
router.get("/", getActiveBanners)

/**
 * @swagger
 * /api/banners/admin:
 *   get:
 *     summary: Get all banners (admin only)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of all banners
 */
router.get("/admin", authenticate, authorize(["admin"]), getAllBanners)

/**
 * @swagger
 * /api/banners/{id}:
 *   get:
 *     summary: Get banner by ID (admin only)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Banner details
 *       404:
 *         description: Banner not found
 */
router.get("/:id", authenticate, authorize(["admin"]), getBannerById)

/**
 * @swagger
 * /api/banners:
 *   post:
 *     summary: Create a new banner (admin only)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - image
 *               - linkUrl
 *               - startDate
 *               - endDate
 *             properties:
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *               linkUrl:
 *                 type: string
 *               displayOrder:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Banner created successfully
 */
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  [
    body("title").notEmpty().withMessage("Banner title is required"),
    body("image").notEmpty().withMessage("Banner image is required"),
    body("linkUrl").notEmpty().withMessage("Link URL is required"),
    body("displayOrder").optional().isInt().withMessage("Display order must be an integer"),
    body("startDate").notEmpty().withMessage("Start date is required").isISO8601().withMessage("Invalid date format"),
    body("endDate").notEmpty().withMessage("End date is required").isISO8601().withMessage("Invalid date format"),
    body("isActive").optional().isBoolean().withMessage("Is active must be a boolean"),
  ],
  validate,
  createBanner,
)

/**
 * @swagger
 * /api/banners/{id}:
 *   put:
 *     summary: Update a banner (admin only)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *               linkUrl:
 *                 type: string
 *               displayOrder:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Banner updated successfully
 *       404:
 *         description: Banner not found
 */
router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  [
    body("title").optional().notEmpty().withMessage("Banner title cannot be empty"),
    body("image").optional().notEmpty().withMessage("Banner image cannot be empty"),
    body("linkUrl").optional().notEmpty().withMessage("Link URL cannot be empty"),
    body("displayOrder").optional().isInt().withMessage("Display order must be an integer"),
    body("startDate").optional().isISO8601().withMessage("Invalid date format"),
    body("endDate").optional().isISO8601().withMessage("Invalid date format"),
    body("isActive").optional().isBoolean().withMessage("Is active must be a boolean"),
  ],
  validate,
  updateBanner,
)

/**
 * @swagger
 * /api/banners/{id}:
 *   delete:
 *     summary: Delete a banner (admin only)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Banner deleted successfully
 *       404:
 *         description: Banner not found
 */
router.delete("/:id", authenticate, authorize(["admin"]), deleteBanner)

export default router
