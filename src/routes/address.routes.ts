import express from "express"
import {
  getAllAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address.controller"
import { authenticate } from "../middlewares/auth.middleware"
import { body } from "express-validator"
import { validate } from "../middlewares/validation.middleware"

const router = express.Router()

/**
 * @swagger
 * /api/addresses:
 *   get:
 *     summary: Get all addresses for the current user
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user addresses
 */
router.get("/", authenticate, getAllAddresses)

/**
 * @swagger
 * /api/addresses/{id}:
 *   get:
 *     summary: Get address by ID
 *     tags: [Addresses]
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
 *         description: Address details
 *       404:
 *         description: Address not found
 */
router.get("/:id", authenticate, getAddressById)

/**
 * @swagger
 * /api/addresses:
 *   post:
 *     summary: Create a new address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addressLine
 *               - city
 *               - area
 *             properties:
 *               addressLine:
 *                 type: string
 *               city:
 *                 type: string
 *               area:
 *                 type: string
 *               landmark:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Address created successfully
 */
router.post(
  "/",
  authenticate,
  [
    body("addressLine").notEmpty().withMessage("Address line is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("area").notEmpty().withMessage("Area is required"),
    body("landmark").optional(),
    body("isDefault").optional().isBoolean().withMessage("Is default must be a boolean"),
  ],
  validate,
  createAddress,
)

/**
 * @swagger
 * /api/addresses/{id}:
 *   put:
 *     summary: Update an address
 *     tags: [Addresses]
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
 *               addressLine:
 *                 type: string
 *               city:
 *                 type: string
 *               area:
 *                 type: string
 *               landmark:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       404:
 *         description: Address not found
 */
router.put(
  "/:id",
  authenticate,
  [
    body("addressLine").optional().notEmpty().withMessage("Address line cannot be empty"),
    body("city").optional().notEmpty().withMessage("City cannot be empty"),
    body("area").optional().notEmpty().withMessage("Area cannot be empty"),
    body("isDefault").optional().isBoolean().withMessage("Is default must be a boolean"),
  ],
  validate,
  updateAddress,
)

/**
 * @swagger
 * /api/addresses/{id}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Addresses]
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
 *         description: Address deleted successfully
 *       404:
 *         description: Address not found
 */
router.delete("/:id", authenticate, deleteAddress)

/**
 * @swagger
 * /api/addresses/{id}/default:
 *   put:
 *     summary: Set address as default
 *     tags: [Addresses]
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
 *         description: Address set as default successfully
 *       404:
 *         description: Address not found
 */
router.put("/:id/default", authenticate, setDefaultAddress)

export default router
