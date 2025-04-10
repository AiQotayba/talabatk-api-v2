"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getAllOrders = exports.cancelOrder = exports.createOrder = exports.getOrderById = exports.getUserOrders = void 0;
const order_model_1 = __importDefault(require("../models/order.model"));
const cart_model_1 = __importDefault(require("../models/cart.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const address_model_1 = __importDefault(require("../models/address.model"));
const logger_1 = require("../utils/logger");
const mongoose_1 = __importDefault(require("mongoose"));
// Get all orders for current user
const getUserOrders = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const orders = await order_model_1.default.find({ user: req.user.id })
            .populate("address", "addressLine city area")
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit);
        const total = await order_model_1.default.countDocuments({ user: req.user.id });
        res.status(200).json({
            success: true,
            data: {
                orders,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Get user orders error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching orders",
        });
    }
};
exports.getUserOrders = getUserOrders;
// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const order = await order_model_1.default.findOne({ _id: req.params.id, user: req.user.id })
            .populate("address", "addressLine city area")
            .populate("items.product", "name image");
        if (!order) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Order not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        logger_1.logger.error("Get order by ID error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching order",
        });
    }
};
exports.getOrderById = getOrderById;
// Create order from cart
const createOrder = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { addressId, paymentMethod } = req.body;
        // Check if address exists
        const address = await address_model_1.default.findOne({ _id: addressId, user: req.user.id });
        if (!address) {
            await session.abortTransaction();
            session.endSession();
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Address not found",
            });
            return;
        }
        // Get user's cart
        const cart = await cart_model_1.default.findOne({ user: req.user.id });
        if (!cart || cart.items.length === 0) {
            await session.abortTransaction();
            session.endSession();
            res.status(400).json({
                success: false,
                error: "Bad Request",
                message: "Cart is empty",
            });
            return;
        }
        // Calculate order items and total amount
        const orderItems = [];
        let totalAmount = 0;
        for (const item of cart.items) {
            const product = await product_model_1.default.findById(item.product);
            if (!product || !product.isActive) {
                await session.abortTransaction();
                session.endSession();
                res.status(400).json({
                    success: false,
                    error: "Bad Request",
                    message: `Product ${item.product} is not available`,
                });
                return;
            }
            const variant = product.variants.find((v) => v._id.toString() === item.variant.toString() && v.isAvailable);
            if (!variant) {
                await session.abortTransaction();
                session.endSession();
                res.status(400).json({
                    success: false,
                    error: "Bad Request",
                    message: `Variant for product ${product.name} is not available`,
                });
                return;
            }
            const subtotal = variant.price * item.quantity;
            totalAmount += subtotal;
            orderItems.push({
                product: item.product,
                variant: item.variant,
                quantity: item.quantity,
                unitPrice: variant.price,
                subtotal,
            });
        }
        // Create order
        const order = await order_model_1.default.create({
            user: req.user.id,
            address: addressId,
            items: orderItems,
            totalAmount,
            status: "pending",
            paymentMethod,
            paymentStatus: paymentMethod === "cash" ? "pending" : "paid",
            orderDate: new Date(),
        });
        // Clear cart after successful order
        cart.items = [];
        await cart.save({ session });
        await session.commitTransaction();
        session.endSession();
        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order,
        });
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        logger_1.logger.error("Create order error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while creating order",
        });
    }
};
exports.createOrder = createOrder;
// Cancel order
const cancelOrder = async (req, res) => {
    try {
        const order = await order_model_1.default.findOne({ _id: req.params.id, user: req.user.id });
        if (!order) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Order not found",
            });
            return;
        }
        // Check if order can be cancelled
        if (order.status !== "pending" && order.status !== "processing") {
            res.status(400).json({
                success: false,
                error: "Bad Request",
                message: "Order cannot be cancelled at this stage",
            });
            return;
        }
        // Update order status
        order.status = "cancelled";
        await order.save();
        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            data: order,
        });
    }
    catch (error) {
        logger_1.logger.error("Cancel order error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while cancelling order",
        });
    }
};
exports.cancelOrder = cancelOrder;
// Admin: Get all orders
const getAllOrders = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status;
        const filter = {};
        if (status) {
            filter.status = status;
        }
        const orders = await order_model_1.default.find(filter)
            .populate("user", "name email phone")
            .populate("address", "addressLine city area")
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit);
        const total = await order_model_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            data: {
                orders,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Get all orders error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching orders",
        });
    }
};
exports.getAllOrders = getAllOrders;
// Admin: Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { status, paymentStatus } = req.body;
        const order = await order_model_1.default.findById(req.params.id);
        if (!order) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Order not found",
            });
            return;
        }
        // Update order status
        if (status) {
            order.status = status;
        }
        // Update payment status
        if (paymentStatus) {
            order.paymentStatus = paymentStatus;
        }
        await order.save();
        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: order,
        });
    }
    catch (error) {
        logger_1.logger.error("Update order status error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while updating order status",
        });
    }
};
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=order.controller.js.map