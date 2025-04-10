"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const restaurant_controller_1 = require("../controllers/restaurant.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Get all restaurants
 *     tags: [Restaurants]
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
 *         description: List of restaurants
 */
router.get("/", restaurant_controller_1.getAllRestaurants);
/**
 * @swagger
 * /api/restaurants/{id}:
 *   get:
 *     summary: Get restaurant by ID
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant details
 *       404:
 *         description: Restaurant not found
 */
router.get("/:id", restaurant_controller_1.getRestaurantById);
/**
 * @swagger
 * /api/restaurants:
 *   post:
 *     summary: Create a new restaurant
 *     tags: [Restaurants]
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
 *               - logo
 *               - contactInfo
 *             properties:
 *               name:
 *                 type: string
 *               logo:
 *                 type: string
 *               contactInfo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 */
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), [
    (0, express_validator_1.body)("name").notEmpty().withMessage("Restaurant name is required"),
    (0, express_validator_1.body)("logo").notEmpty().withMessage("Restaurant logo is required"),
    (0, express_validator_1.body)("contactInfo").notEmpty().withMessage("Contact information is required"),
], validation_middleware_1.validate, restaurant_controller_1.createRestaurant);
/**
 * @swagger
 * /api/restaurants/{id}:
 *   put:
 *     summary: Update a restaurant
 *     tags: [Restaurants]
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
 *               logo:
 *                 type: string
 *               contactInfo:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Restaurant updated successfully
 *       404:
 *         description: Restaurant not found
 */
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), [
    (0, express_validator_1.body)("name").optional().notEmpty().withMessage("Restaurant name cannot be empty"),
    (0, express_validator_1.body)("logo").optional().notEmpty().withMessage("Restaurant logo cannot be empty"),
    (0, express_validator_1.body)("contactInfo").optional().notEmpty().withMessage("Contact information cannot be empty"),
    (0, express_validator_1.body)("isActive").optional().isBoolean().withMessage("Is active must be a boolean"),
], validation_middleware_1.validate, restaurant_controller_1.updateRestaurant);
/**
 * @swagger
 * /api/restaurants/{id}:
 *   delete:
 *     summary: Delete a restaurant
 *     tags: [Restaurants]
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
 *         description: Restaurant deleted successfully
 *       400:
 *         description: Cannot delete restaurant with associated products
 *       404:
 *         description: Restaurant not found
 */
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), restaurant_controller_1.deleteRestaurant);
/**
 * @swagger
 * /api/restaurants/{id}/products:
 *   get:
 *     summary: Get products by restaurant
 *     tags: [Restaurants]
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
 *         description: List of products in the restaurant
 *       404:
 *         description: Restaurant not found
 */
router.get("/:id/products", restaurant_controller_1.getProductsByRestaurant);
exports.default = router;
//# sourceMappingURL=restaurant.routes.js.map