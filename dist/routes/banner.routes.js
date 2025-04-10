"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const banner_controller_1 = require("../controllers/banner.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const router = express_1.default.Router();
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
router.get("/", banner_controller_1.getActiveBanners);
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
router.get("/admin", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), banner_controller_1.getAllBanners);
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
router.get("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), banner_controller_1.getBannerById);
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
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), [
    (0, express_validator_1.body)("title").notEmpty().withMessage("Banner title is required"),
    (0, express_validator_1.body)("image").notEmpty().withMessage("Banner image is required"),
    (0, express_validator_1.body)("linkUrl").notEmpty().withMessage("Link URL is required"),
    (0, express_validator_1.body)("displayOrder").optional().isInt().withMessage("Display order must be an integer"),
    (0, express_validator_1.body)("startDate").notEmpty().withMessage("Start date is required").isISO8601().withMessage("Invalid date format"),
    (0, express_validator_1.body)("endDate").notEmpty().withMessage("End date is required").isISO8601().withMessage("Invalid date format"),
    (0, express_validator_1.body)("isActive").optional().isBoolean().withMessage("Is active must be a boolean"),
], validation_middleware_1.validate, banner_controller_1.createBanner);
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
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), [
    (0, express_validator_1.body)("title").optional().notEmpty().withMessage("Banner title cannot be empty"),
    (0, express_validator_1.body)("image").optional().notEmpty().withMessage("Banner image cannot be empty"),
    (0, express_validator_1.body)("linkUrl").optional().notEmpty().withMessage("Link URL cannot be empty"),
    (0, express_validator_1.body)("displayOrder").optional().isInt().withMessage("Display order must be an integer"),
    (0, express_validator_1.body)("startDate").optional().isISO8601().withMessage("Invalid date format"),
    (0, express_validator_1.body)("endDate").optional().isISO8601().withMessage("Invalid date format"),
    (0, express_validator_1.body)("isActive").optional().isBoolean().withMessage("Is active must be a boolean"),
], validation_middleware_1.validate, banner_controller_1.updateBanner);
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
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), banner_controller_1.deleteBanner);
exports.default = router;
//# sourceMappingURL=banner.routes.js.map