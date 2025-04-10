import express from "express"
import {
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductVariants,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from "../controllers/product.controller"
import { authenticate, authorize } from "../middlewares/auth.middleware"
import { body } from "express-validator"
import { validate } from "../middlewares/validation.middleware"

const router = express.Router()

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of products
 */
router.get("/", getAllProducts)

/**
 * @swagger
 * /api/products/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of featured products
 */
router.get("/featured", getFeaturedProducts)

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get("/:id", getProductById)

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
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
 *               - description
 *               - image
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               category:
 *                 type: string
 *               isFeatured:
 *                 type: boolean
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - price
 *                     - restaurant
 *                   properties:
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     restaurant:
 *                       type: string
 *                     isAvailable:
 *                       type: boolean
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  [
    body("name").notEmpty().withMessage("Product name is required"),
    body("description").notEmpty().withMessage("Product description is required"),
    body("image").notEmpty().withMessage("Product image is required"),
    body("category").notEmpty().withMessage("Category is required").isMongoId().withMessage("Invalid category ID"),
    body("isFeatured").optional().isBoolean().withMessage("Is featured must be a boolean"),
    body("variants").optional().isArray().withMessage("Variants must be an array"),
    body("variants.*.name").optional().notEmpty().withMessage("Variant name is required"),
    body("variants.*.price")
      .optional()
      .isNumeric()
      .withMessage("Variant price must be a number")
      .custom((value) => value >= 0)
      .withMessage("Variant price cannot be negative"),
    body("variants.*.restaurant")
      .optional()
      .notEmpty()
      .withMessage("Restaurant is required")
      .isMongoId()
      .withMessage("Invalid restaurant ID"),
    body("variants.*.isAvailable").optional().isBoolean().withMessage("Is available must be a boolean"),
  ],
  validate,
  createProduct,
)

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
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
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               category:
 *                 type: string
 *               isFeatured:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  [
    body("name").optional().notEmpty().withMessage("Product name cannot be empty"),
    body("description").optional().notEmpty().withMessage("Product description cannot be empty"),
    body("image").optional().notEmpty().withMessage("Product image cannot be empty"),
    body("category").optional().isMongoId().withMessage("Invalid category ID"),
    body("isFeatured").optional().isBoolean().withMessage("Is featured must be a boolean"),
    body("isActive").optional().isBoolean().withMessage("Is active must be a boolean"),
  ],
  validate,
  updateProduct,
)

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
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
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete("/:id", authenticate, authorize(["admin"]), deleteProduct)

/**
 * @swagger
 * /api/products/{id}/variants:
 *   get:
 *     summary: Get product variants
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of product variants
 *       404:
 *         description: Product not found
 */
router.get("/:id/variants", getProductVariants)

/**
 * @swagger
 * /api/products/{id}/variants:
 *   post:
 *     summary: Add a product variant
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - restaurant
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               restaurant:
 *                 type: string
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Product variant added successfully
 *       404:
 *         description: Product not found
 */
router.post(
  "/:id/variants",
  authenticate,
  authorize(["admin"]),
  [
    body("name").notEmpty().withMessage("Variant name is required"),
    body("price")
      .notEmpty()
      .withMessage("Variant price is required")
      .isNumeric()
      .withMessage("Variant price must be a number")
      .custom((value) => value >= 0)
      .withMessage("Variant price cannot be negative"),
    body("restaurant")
      .notEmpty()
      .withMessage("Restaurant is required")
      .isMongoId()
      .withMessage("Invalid restaurant ID"),
    body("isAvailable").optional().isBoolean().withMessage("Is available must be a boolean"),
  ],
  validate,
  addProductVariant,
)

/**
 * @swagger
 * /api/products/{id}/variants/{variantId}:
 *   put:
 *     summary: Update a product variant
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: variantId
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
 *               price:
 *                 type: number
 *               restaurant:
 *                 type: string
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product variant updated successfully
 *       404:
 *         description: Product or variant not found
 */
router.put(
  "/:id/variants/:variantId",
  authenticate,
  authorize(["admin"]),
  [
    body("name").optional().notEmpty().withMessage("Variant name cannot be empty"),
    body("price")
      .optional()
      .isNumeric()
      .withMessage("Variant price must be a number")
      .custom((value) => value >= 0)
      .withMessage("Variant price cannot be negative"),
    body("restaurant").optional().isMongoId().withMessage("Invalid restaurant ID"),
    body("isAvailable").optional().isBoolean().withMessage("Is available must be a boolean"),
  ],
  validate,
  updateProductVariant,
)

/**
 * @swagger
 * /api/products/{id}/variants/{variantId}:
 *   delete:
 *     summary: Delete a product variant
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product variant deleted successfully
 *       404:
 *         description: Product or variant not found
 */
router.delete("/:id/variants/:variantId", authenticate, authorize(["admin"]), deleteProductVariant)

export default router
