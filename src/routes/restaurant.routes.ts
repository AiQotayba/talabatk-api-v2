import express from "express"
import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getProductsByRestaurant,
} from "../controllers/restaurant.controller"
import { authenticate, authorize } from "../middlewares/auth.middleware"
import { body } from "express-validator"
import { validate } from "../middlewares/validation.middleware"

const router = express.Router()

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
router.get("/", getAllRestaurants)

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
router.get("/:id", getRestaurantById)

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
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  [
    body("name").notEmpty().withMessage("Restaurant name is required"),
    body("logo").notEmpty().withMessage("Restaurant logo is required"),
    body("contactInfo").notEmpty().withMessage("Contact information is required"),
  ],
  validate,
  createRestaurant,
)

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
router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  [
    body("name").optional().notEmpty().withMessage("Restaurant name cannot be empty"),
    body("logo").optional().notEmpty().withMessage("Restaurant logo cannot be empty"),
    body("contactInfo").optional().notEmpty().withMessage("Contact information cannot be empty"),
    body("isActive").optional().isBoolean().withMessage("Is active must be a boolean"),
  ],
  validate,
  updateRestaurant,
)

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
router.delete("/:id", authenticate, authorize(["admin"]), deleteRestaurant)

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
router.get("/:id/products", getProductsByRestaurant)

export default router
