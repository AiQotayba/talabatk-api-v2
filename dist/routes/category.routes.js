"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("../controllers/category.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/", category_controller_1.getAllCategories);
/**
 * @swagger
 * /api/categories/featured:
 *   get:
 *     summary: Get featured categories for homepage
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of featured categories
 */
router.get("/featured", category_controller_1.getFeaturedCategories);
/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
router.get("/:id", category_controller_1.getCategoryById);
/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               parent:
 *                 type: string
 *               showInHomepage:
 *                 type: boolean
 *               displayOrder:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Bad request
 */
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), [
    (0, express_validator_1.body)("name").notEmpty().withMessage("Category name is required"),
    (0, express_validator_1.body)("parent").optional().isMongoId().withMessage("Invalid parent category ID"),
    (0, express_validator_1.body)("showInHomepage").optional().isBoolean().withMessage("Show in homepage must be a boolean"),
    (0, express_validator_1.body)("displayOrder").optional().isInt().withMessage("Display order must be an integer"),
], validation_middleware_1.validate, category_controller_1.createCategory);
/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
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
 *               name:
 *                 type: string
 *               parent:
 *                 type: string
 *               showInHomepage:
 *                 type: boolean
 *               displayOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 */
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), [
    (0, express_validator_1.body)("name").optional().notEmpty().withMessage("Category name cannot be empty"),
    (0, express_validator_1.body)("parent").optional().isMongoId().withMessage("Invalid parent category ID"),
    (0, express_validator_1.body)("showInHomepage").optional().isBoolean().withMessage("Show in homepage must be a boolean"),
    (0, express_validator_1.body)("displayOrder").optional().isInt().withMessage("Display order must be an integer"),
], validation_middleware_1.validate, category_controller_1.updateCategory);
/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
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
 *         description: Category deleted successfully
 *       400:
 *         description: Cannot delete category with child categories or products
 *       404:
 *         description: Category not found
 */
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), category_controller_1.deleteCategory);
/**
 * @swagger
 * /api/categories/{id}/products:
 *   get:
 *     summary: Get products by category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *         description: List of products in the category
 *       404:
 *         description: Category not found
 */
router.get("/:id/products", category_controller_1.getProductsByCategory);
exports.default = router;
//# sourceMappingURL=category.routes.js.map