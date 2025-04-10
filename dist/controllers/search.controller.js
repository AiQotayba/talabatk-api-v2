"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRestaurants = exports.searchProducts = exports.search = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
const restaurant_model_1 = __importDefault(require("../models/restaurant.model"));
const category_model_1 = __importDefault(require("../models/category.model"));
const logger_1 = require("../utils/logger");
// Search products, restaurants, and categories
const search = async (req, res) => {
    try {
        const { query, type } = req.query;
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        if (!query || query === "") {
            res.status(400).json({
                success: false,
                error: "Bad Request",
                message: "Search query is required",
            });
            return;
        }
        const searchQuery = { $regex: query, $options: "i" };
        let results = {};
        let total = 0;
        // Search by specific type if provided
        if (type) {
            switch (type) {
                case "products":
                    results.products = await product_model_1.default.find({ name: searchQuery, isActive: true })
                        .populate("category", "name")
                        .skip(skip)
                        .limit(limit);
                    total = await product_model_1.default.countDocuments({ name: searchQuery, isActive: true });
                    break;
                case "restaurants":
                    results.restaurants = await restaurant_model_1.default.find({ name: searchQuery, isActive: true }).skip(skip).limit(limit);
                    total = await restaurant_model_1.default.countDocuments({ name: searchQuery, isActive: true });
                    break;
                case "categories":
                    results.categories = await category_model_1.default.find({ name: searchQuery }).skip(skip).limit(limit);
                    total = await category_model_1.default.countDocuments({ name: searchQuery });
                    break;
                default:
                    res.status(400).json({
                        success: false,
                        error: "Bad Request",
                        message: "Invalid search type",
                    });
                    return;
            }
        }
        else {
            // Search all types if no specific type provided
            const [products, restaurants, categories] = await Promise.all([
                product_model_1.default.find({ name: searchQuery, isActive: true }).populate("category", "name").limit(5),
                restaurant_model_1.default.find({ name: searchQuery, isActive: true }).limit(5),
                category_model_1.default.find({ name: searchQuery }).limit(5),
            ]);
            results = {
                products,
                restaurants,
                categories,
            };
            // For pagination, we'll use the total count of all types combined
            total = await product_model_1.default.countDocuments({ name: searchQuery, isActive: true });
            total += await restaurant_model_1.default.countDocuments({ name: searchQuery, isActive: true });
            total += await category_model_1.default.countDocuments({ name: searchQuery });
        }
        res.status(200).json({
            success: true,
            data: {
                results,
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
        logger_1.logger.error("Search error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while searching",
        });
    }
};
exports.search = search;
// Search products
const searchProducts = async (req, res) => {
    try {
        const { query, category } = req.query;
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        if (!query || query === "") {
            res.status(400).json({
                success: false,
                error: "Bad Request",
                message: "Search query is required",
            });
            return;
        }
        const searchQuery = { name: { $regex: query, $options: "i" }, isActive: true };
        // Add category filter if provided
        if (category) {
            searchQuery.category = category;
        }
        const products = await product_model_1.default.find(searchQuery).populate("category", "name").skip(skip).limit(limit);
        const total = await product_model_1.default.countDocuments(searchQuery);
        res.status(200).json({
            success: true,
            data: {
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
        logger_1.logger.error("Search products error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while searching products",
        });
    }
};
exports.searchProducts = searchProducts;
// Search restaurants
const searchRestaurants = async (req, res) => {
    try {
        const { query } = req.query;
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        if (!query || query === "") {
            res.status(400).json({
                success: false,
                error: "Bad Request",
                message: "Search query is required",
            });
            return;
        }
        const searchQuery = { name: { $regex: query, $options: "i" }, isActive: true };
        const restaurants = await restaurant_model_1.default.find(searchQuery).skip(skip).limit(limit);
        const total = await restaurant_model_1.default.countDocuments(searchQuery);
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
        logger_1.logger.error("Search restaurants error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while searching restaurants",
        });
    }
};
exports.searchRestaurants = searchRestaurants;
//# sourceMappingURL=search.controller.js.map