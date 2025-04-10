"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsByRestaurant = exports.deleteRestaurant = exports.updateRestaurant = exports.createRestaurant = exports.getRestaurantById = exports.getAllRestaurants = void 0;
const restaurant_model_1 = __importDefault(require("../models/restaurant.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const logger_1 = require("../utils/logger");
// Get all restaurants
const getAllRestaurants = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const restaurants = await restaurant_model_1.default.find({ isActive: true }).skip(skip).limit(limit);
        const total = await restaurant_model_1.default.countDocuments({ isActive: true });
        res.status(200).json({
            success: true,
            data: {
                restaurants,
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
        logger_1.logger.error("Get all restaurants error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching restaurants",
        });
    }
};
exports.getAllRestaurants = getAllRestaurants;
// Get restaurant by ID
const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await restaurant_model_1.default.findOne({ _id: req.params.id, isActive: true });
        if (!restaurant) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Restaurant not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: restaurant,
        });
    }
    catch (error) {
        logger_1.logger.error("Get restaurant by ID error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching restaurant",
        });
    }
};
exports.getRestaurantById = getRestaurantById;
// Create restaurant
const createRestaurant = async (req, res) => {
    try {
        const { name, logo, contactInfo } = req.body;
        const restaurant = await restaurant_model_1.default.create({
            name,
            logo,
            contactInfo,
            isActive: true,
        });
        res.status(201).json({
            success: true,
            message: "Restaurant created successfully",
            data: restaurant,
        });
    }
    catch (error) {
        logger_1.logger.error("Create restaurant error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while creating restaurant",
        });
    }
};
exports.createRestaurant = createRestaurant;
// Update restaurant
const updateRestaurant = async (req, res) => {
    try {
        const { name, logo, contactInfo, isActive } = req.body;
        const restaurant = await restaurant_model_1.default.findById(req.params.id);
        if (!restaurant) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Restaurant not found",
            });
            return;
        }
        // Update restaurant fields
        if (name)
            restaurant.name = name;
        if (logo)
            restaurant.logo = logo;
        if (contactInfo)
            restaurant.contactInfo = contactInfo;
        if (isActive !== undefined)
            restaurant.isActive = isActive;
        await restaurant.save();
        res.status(200).json({
            success: true,
            message: "Restaurant updated successfully",
            data: restaurant,
        });
    }
    catch (error) {
        logger_1.logger.error("Update restaurant error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while updating restaurant",
        });
    }
};
exports.updateRestaurant = updateRestaurant;
// Delete restaurant
const deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await restaurant_model_1.default.findById(req.params.id);
        if (!restaurant) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Restaurant not found",
            });
            return;
        }
        // Check if restaurant has products
        const products = await product_model_1.default.findOne({ "variants.restaurant": req.params.id });
        if (products) {
            res.status(400).json({
                success: false,
                error: "Bad Request",
                message: "Cannot delete restaurant with associated products",
            });
            return;
        }
        await restaurant.deleteOne();
        res.status(200).json({
            success: true,
            message: "Restaurant deleted successfully",
        });
    }
    catch (error) {
        logger_1.logger.error("Delete restaurant error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while deleting restaurant",
        });
    }
};
exports.deleteRestaurant = deleteRestaurant;
// Get products by restaurant
const getProductsByRestaurant = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const restaurant = await restaurant_model_1.default.findOne({ _id: req.params.id, isActive: true });
        if (!restaurant) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Restaurant not found",
            });
            return;
        }
        // Find products where at least one variant belongs to this restaurant
        const products = await product_model_1.default.find({
            "variants.restaurant": req.params.id,
            isActive: true,
        })
            .populate("category", "name")
            .skip(skip)
            .limit(limit);
        const total = await product_model_1.default.countDocuments({
            "variants.restaurant": req.params.id,
            isActive: true,
        });
        res.status(200).json({
            success: true,
            data: {
                restaurant: {
                    id: restaurant._id,
                    name: restaurant.name,
                },
                products,
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
        logger_1.logger.error("Get products by restaurant error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching products",
        });
    }
};
exports.getProductsByRestaurant = getProductsByRestaurant;
//# sourceMappingURL=restaurant.controller.js.map