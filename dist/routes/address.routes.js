"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const address_controller_1 = require("../controllers/address.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const router = express_1.default.Router();
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
router.get("/", auth_middleware_1.authenticate, address_controller_1.getAllAddresses);
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
router.get("/:id", auth_middleware_1.authenticate, address_controller_1.getAddressById);
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
router.post("/", auth_middleware_1.authenticate, [
    (0, express_validator_1.body)("addressLine").notEmpty().withMessage("Address line is required"),
    (0, express_validator_1.body)("city").notEmpty().withMessage("City is required"),
    (0, express_validator_1.body)("area").notEmpty().withMessage("Area is required"),
    (0, express_validator_1.body)("landmark").optional(),
    (0, express_validator_1.body)("isDefault").optional().isBoolean().withMessage("Is default must be a boolean"),
], validation_middleware_1.validate, address_controller_1.createAddress);
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
router.put("/:id", auth_middleware_1.authenticate, [
    (0, express_validator_1.body)("addressLine").optional().notEmpty().withMessage("Address line cannot be empty"),
    (0, express_validator_1.body)("city").optional().notEmpty().withMessage("City cannot be empty"),
    (0, express_validator_1.body)("area").optional().notEmpty().withMessage("Area cannot be empty"),
    (0, express_validator_1.body)("isDefault").optional().isBoolean().withMessage("Is default must be a boolean"),
], validation_middleware_1.validate, address_controller_1.updateAddress);
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
router.delete("/:id", auth_middleware_1.authenticate, address_controller_1.deleteAddress);
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
router.put("/:id/default", auth_middleware_1.authenticate, address_controller_1.setDefaultAddress);
exports.default = router;
//# sourceMappingURL=address.routes.js.map