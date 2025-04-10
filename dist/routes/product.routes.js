"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const router = express_1.default.Router();
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
router.get("/", product_controller_1.getAllProducts);
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
router.get("/featured", product_controller_1.getFeaturedProducts);
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
router.get("/:id", product_controller_1.getProductById);
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
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), [
    (0, express_validator_1.body)("name").notEmpty().withMessage("Product name is required"),
    (0, express_validator_1.body)("description").notEmpty().withMessage("Product description is required"),
    (0, express_validator_1.body)("image").notEmpty().withMessage("Product image is required"),
    (0, express_validator_1.body)("category").notEmpty().withMessage("Category is required").isMongoId().withMessage("Invalid category ID"),
    (0, express_validator_1.body)("isFeatured").optional().isBoolean().withMessage("Is featured must be a boolean"),
    (0, express_validator_1.body)("variants").optional().isArray().withMessage("Variants must be an array"),
    (0, express_validator_1.body)("variants.*.name").optional().notEmpty().withMessage("Variant name is required"),
    (0, express_validator_1.body)("variants.*.price")
        .optional()
        .isNumeric()
        .withMessage("Variant price must be a number")
        .custom((value) => value >= 0)
        .withMessage("Variant price cannot be negative"),
    (0, express_validator_1.body)("variants.*.restaurant")
        .optional()
        .notEmpty()
        .withMessage("Restaurant is required")
        .isMongoId()
        .withMessage("Invalid restaurant ID"),
    (0, express_validator_1.body)("variants.*.isAvailable").optional().isBoolean().withMessage("Is available must be a boolean"),
], validation_middleware_1.validate, product_controller_1.createProduct);
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
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), [
    (0, express_validator_1.body)("name").optional().notEmpty().withMessage("Product name cannot be empty"),
    (0, express_validator_1.body)("description").optional().notEmpty().withMessage("Product description cannot be empty"),
    (0, express_validator_1.body)("image").optional().notEmpty().withMessage("Product image cannot be empty"),
    (0, express_validator_1.body)("category").optional().isMongoId().withMessage("Invalid category ID"),
    (0, express_validator_1.body)("isFeatured").optional().isBoolean().withMessage("Is featured must be a boolean"),
    (0, express_validator_1.body)("isActive").optional().isBoolean().withMessage("Is active must be a boolean"),
], validation_middleware_1.validate, product_controller_1.updateProduct);
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
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), product_controller_1.deleteProduct);
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
router.get("/:id/variants", product_controller_1.getProductVariants);
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
router.post("/:id/variants", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), [
    (0, express_validator_1.body)("name").notEmpty().withMessage("Variant name is required"),
    (0, express_validator_1.body)("price")
        .notEmpty()
        .withMessage("Variant price is required")
        .isNumeric()
        .withMessage("Variant price must be a number")
        .custom((value) => value >= 0)
        .withMessage("Variant price cannot be negative"),
    (0, express_validator_1.body)("restaurant")
        .notEmpty()
        .withMessage("Restaurant is required")
        .isMongoId()
        .withMessage("Invalid restaurant ID"),
    (0, express_validator_1.body)("isAvailable").optional().isBoolean().withMessage("Is available must be a boolean"),
], validation_middleware_1.validate, product_controller_1.addProductVariant);
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
router.put("/:id/variants/:variantId", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), [
    (0, express_validator_1.body)("name").optional().notEmpty().withMessage("Variant name cannot be empty"),
    (0, express_validator_1.body)("price")
        .optional()
        .isNumeric()
        .withMessage("Variant price must be a number")
        .custom((value) => value >= 0)
        .withMessage("Variant price cannot be negative"),
    (0, express_validator_1.body)("restaurant").optional().isMongoId().withMessage("Invalid restaurant ID"),
    (0, express_validator_1.body)("isAvailable").optional().isBoolean().withMessage("Is available must be a boolean"),
], validation_middleware_1.validate, product_controller_1.updateProductVariant);
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
router.delete("/:id/variants/:variantId", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), product_controller_1.deleteProductVariant);
exports.default = router;
//# sourceMappingURL=product.routes.js.map