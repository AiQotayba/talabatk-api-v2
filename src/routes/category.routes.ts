import express from "express"
import {
  getAllCategories,
  getCategoryById,
  getFeaturedCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductsByCategory,
} from "../controllers/category.controller"
import { authenticate, authorize } from "../middlewares/auth.middleware"
import { body } from "express-validator"
import { validate } from "../middlewares/validation.middleware"

const router = express.Router()

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
router.get("/", getAllCategories)

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
router.get("/featured", getFeaturedCategories)

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
router.get("/:id", getCategoryById)

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
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  [
    body("name").notEmpty().withMessage("Category name is required"),
    body("parent").optional().isMongoId().withMessage("Invalid parent category ID"),
    body("showInHomepage").optional().isBoolean().withMessage("Show in homepage must be a boolean"),
    body("displayOrder").optional().isInt().withMessage("Display order must be an integer"),
  ],
  validate,
  createCategory,
)

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
router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  [
    body("name").optional().notEmpty().withMessage("Category name cannot be empty"),
    body("parent").optional().isMongoId().withMessage("Invalid parent category ID"),
    body("showInHomepage").optional().isBoolean().withMessage("Show in homepage must be a boolean"),
    body("displayOrder").optional().isInt().withMessage("Display order must be an integer"),
  ],
  validate,
  updateCategory,
)

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
router.delete("/:id", authenticate, authorize(["admin"]), deleteCategory)

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
router.get("/:id/products", getProductsByCategory)

export default router
