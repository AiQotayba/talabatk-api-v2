"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeCartItem = exports.updateCartItem = exports.addItemToCart = exports.getCart = void 0;
const cart_model_1 = __importDefault(require("../models/cart.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const logger_1 = require("../utils/logger");
const mongoose_1 = __importDefault(require("mongoose"));
// Get cart for current user
const getCart = async (req, res) => {
    try {
        let cart = await cart_model_1.default.findOne({ user: req.user.id }).populate({
            path: "items.product",
            select: "name image",
        });
        if (!cart) {
            cart = {
                user: req.user.id,
                items: [],
            };
        }
        res.status(200).json({
            success: true,
            data: cart,
        });
    }
    catch (error) {
        logger_1.logger.error("Get cart error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching cart",
        });
    }
};
exports.getCart = getCart;
// Add item to cart
const addItemToCart = async (req, res) => {
    try {
        const { productId, variantId, quantity } = req.body;
        // Validate product and variant
        const product = await product_model_1.default.findOne({ _id: productId, isActive: true });
        if (!product) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Product not found",
            });
            return;
        }
        const variant = product.variants.find((v) => v._id.toString() === variantId && v.isAvailable);
        if (!variant) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Product variant not found or not available",
            });
            return;
        }
        // Find or create cart
        let cart = await cart_model_1.default.findOne({ user: req.user.id });
        if (!cart) {
            cart = await cart_model_1.default.create({
                user: req.user.id,
                items: [],
            });
        }
        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex((item) => item.product.toString() === productId && item.variant.toString() === variantId);
        if (existingItemIndex > -1) {
            // Update quantity if item exists
            cart.items[existingItemIndex].quantity += quantity;
        }
        else {
            // Add new item if it doesn't exist
            cart.items.push({
                product: new mongoose_1.default.Types.ObjectId(productId),
                variant: new mongoose_1.default.Types.ObjectId(variantId),
                quantity,
            });
        }
        await cart.save();
        // Populate product details for response
        await cart.populate({
            path: "items.product",
            select: "name image",
        });
        res.status(200).json({
            success: true,
            message: "Item added to cart successfully",
            data: cart,
        });
    }
    catch (error) {
        logger_1.logger.error("Add item to cart error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while adding item to cart",
        });
    }
};
exports.addItemToCart = addItemToCart;
// Update cart item quantity
const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await cart_model_1.default.findOne({ user: req.user.id });
        if (!cart) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Cart not found",
            });
            return;
        }
        // Find item in cart
        const itemIndex = cart.items.findIndex((item) => item._id.toString() === req.params.itemId);
        if (itemIndex === -1) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Item not found in cart",
            });
            return;
        }
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        // Populate product details for response
        await cart.populate({
            path: "items.product",
            select: "name image",
        });
        res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            data: cart,
        });
    }
    catch (error) {
        logger_1.logger.error("Update cart item error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while updating cart item",
        });
    }
};
exports.updateCartItem = updateCartItem;
// Remove item from cart
const removeCartItem = async (req, res) => {
    try {
        const cart = await cart_model_1.default.findOne({ user: req.user.id });
        if (!cart) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Cart not found",
            });
            return;
        }
        // Find item in cart
        const itemIndex = cart.items.findIndex((item) => item._id.toString() === req.params.itemId);
        if (itemIndex === -1) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Item not found in cart",
            });
            return;
        }
        // Remove item
        cart.items.splice(itemIndex, 1);
        await cart.save();
        res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
            data: cart,
        });
    }
    catch (error) {
        logger_1.logger.error("Remove cart item error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while removing cart item",
        });
    }
};
exports.removeCartItem = removeCartItem;
// Clear cart
const clearCart = async (req, res) => {
    try {
        const cart = await cart_model_1.default.findOne({ user: req.user.id });
        if (!cart) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Cart not found",
            });
            return;
        }
        // Clear all items
        cart.items = [];
        await cart.save();
        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            data: cart,
        });
    }
    catch (error) {
        logger_1.logger.error("Clear cart error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while clearing cart",
        });
    }
};
exports.clearCart = clearCart;
//# sourceMappingURL=cart.controller.js.map