"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductVariant = exports.updateProductVariant = exports.addProductVariant = exports.getProductVariants = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getFeaturedProducts = exports.getAllProducts = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
const category_model_1 = __importDefault(require("../models/category.model"));
const restaurant_model_1 = __importDefault(require("../models/restaurant.model"));
const logger_1 = require("../utils/logger");
const mongoose_1 = __importDefault(require("mongoose"));
// Get all products
const getAllProducts = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = { isActive: true };
        // Add category filter if provided
        if (req.query.category) {
            filter.category = req.query.category;
        }
        const products = await product_model_1.default.find(filter).populate("category", "name").skip(skip).limit(limit);
        const total = await product_model_1.default.countDocuments(filter);
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
        logger_1.logger.error("Get all products error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching products",
        });
    }
};
exports.getAllProducts = getAllProducts;
// Get featured products
const getFeaturedProducts = async (req, res) => {
    try {
        const products = await product_model_1.default.find({ isFeatured: true, isActive: true }).populate("category", "name").limit(10);
        res.status(200).json({
            success: true,
            data: products,
        });
    }
    catch (error) {
        logger_1.logger.error("Get featured products error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching featured products",
        });
    }
};
exports.getFeaturedProducts = getFeaturedProducts;
// Get product by ID
const getProductById = async (req, res) => {
    try {
        const product = await product_model_1.default.findOne({ _id: req.params.id, isActive: true }).populate("category", "name");
        if (!product) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Product not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        logger_1.logger.error("Get product by ID error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching product",
        });
    }
};
exports.getProductById = getProductById;
// Create product
const createProduct = async (req, res) => {
    try {
        const { name, description, image, category, isFeatured, variants } = req.body;
        // Check if category exists
        const categoryExists = await category_model_1.default.findById(category);
        if (!categoryExists) {
            res.status(400).json({
                success: false,
                error: "Bad Request",
                message: "Category not found",
            });
            return;
        }
        // Validate variants if provided
        if (variants && variants.length > 0) {
            for (const variant of variants) {
                // Check if restaurant exists
                const restaurantExists = await restaurant_model_1.default.findById(variant.restaurant);
                if (!restaurantExists) {
                    res.status(400).json({
                        success: false,
                        error: "Bad Request",
                        message: `Restaurant with ID ${variant.restaurant} not found`,
                    });
                    return;
                }
            }
        }
        const product = await product_model_1.default.create({
            name,
            description,
            image,
            category,
            isFeatured: isFeatured || false,
            isActive: true,
            variants: variants || [],
        });
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    }
    catch (error) {
        logger_1.logger.error("Create product error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while creating product",
        });
    }
};
exports.createProduct = createProduct;
// Update product
const updateProduct = async (req, res) => {
    try {
        const { name, description, image, category, isFeatured, isActive } = req.body;
        const product = await product_model_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Product not found",
            });
            return;
        }
        // Check if category exists if provided
        if (category) {
            const categoryExists = await category_model_1.default.findById(category);
            if (!categoryExists) {
                res.status(400).json({
                    success: false,
                    error: "Bad Request",
                    message: "Category not found",
                });
                return;
            }
        }
        // Update product fields
        if (name)
            product.name = name;
        if (description)
            product.description = description;
        if (image)
            product.image = image;
        if (category)
            product.category = new mongoose_1.default.Types.ObjectId(category);
        if (isFeatured !== undefined)
            product.isFeatured = isFeatured;
        if (isActive !== undefined)
            product.isActive = isActive;
        await product.save();
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    }
    catch (error) {
        logger_1.logger.error("Update product error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while updating product",
        });
    }
};
exports.updateProduct = updateProduct;
// Delete product
const deleteProduct = async (req, res) => {
    try {
        const product = await product_model_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Product not found",
            });
            return;
        }
        await product.deleteOne();
        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    }
    catch (error) {
        logger_1.logger.error("Delete product error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while deleting product",
        });
    }
};
exports.deleteProduct = deleteProduct;
// Get product variants
const getProductVariants = async (req, res) => {
    try {
        const product = await product_model_1.default.findOne({ _id: req.params.id, isActive: true });
        if (!product) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Product not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: product.variants,
        });
    }
    catch (error) {
        logger_1.logger.error("Get product variants error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching product variants",
        });
    }
};
exports.getProductVariants = getProductVariants;
// Add product variant
const addProductVariant = async (req, res) => {
    try {
        const { name, price, restaurant, isAvailable } = req.body;
        const product = await product_model_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Product not found",
            });
            return;
        }
        // Check if restaurant exists
        const restaurantExists = await restaurant_model_1.default.findById(restaurant);
        if (!restaurantExists) {
            res.status(400).json({
                success: false,
                error: "Bad Request",
                message: "Restaurant not found",
            });
            return;
        }
        // Add new variant
        product.variants.push({
            name,
            price,
            restaurant: new mongoose_1.default.Types.ObjectId(restaurant),
            isAvailable: isAvailable !== undefined ? isAvailable : true,
        });
        await product.save();
        res.status(201).json({
            success: true,
            message: "Product variant added successfully",
            data: product.variants[product.variants.length - 1],
        });
    }
    catch (error) {
        logger_1.logger.error("Add product variant error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while adding product variant",
        });
    }
};
exports.addProductVariant = addProductVariant;
// Update product variant
const updateProductVariant = async (req, res) => {
    try {
        const { name, price, restaurant, isAvailable } = req.body;
        const product = await product_model_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Product not found",
            });
            return;
        }
        // Find variant by ID
        const variantIndex = product.variants.findIndex((v) => v._id.toString() === req.params.variantId);
        if (variantIndex === -1) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Variant not found",
            });
            return;
        }
        // Check if restaurant exists if provided
        if (restaurant) {
            const restaurantExists = await restaurant_model_1.default.findById(restaurant);
            if (!restaurantExists) {
                res.status(400).json({
                    success: false,
                    error: "Bad Request",
                    message: "Restaurant not found",
                });
                return;
            }
        }
        // Update variant fields
        if (name)
            product.variants[variantIndex].name = name;
        if (price)
            product.variants[variantIndex].price = price;
        if (restaurant)
            product.variants[variantIndex].restaurant = new mongoose_1.default.Types.ObjectId(restaurant);
        if (isAvailable !== undefined)
            product.variants[variantIndex].isAvailable = isAvailable;
        await product.save();
        res.status(200).json({
            success: true,
            message: "Product variant updated successfully",
            data: product.variants[variantIndex],
        });
    }
    catch (error) {
        logger_1.logger.error("Update product variant error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while updating product variant",
        });
    }
};
exports.updateProductVariant = updateProductVariant;
// Delete product variant
const deleteProductVariant = async (req, res) => {
    try {
        const product = await product_model_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Product not found",
            });
            return;
        }
        // Find variant by ID
        const variantIndex = product.variants.findIndex((v) => v._id.toString() === req.params.variantId);
        if (variantIndex === -1) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Variant not found",
            });
            return;
        }
        // Remove variant
        product.variants.splice(variantIndex, 1);
        await product.save();
        res.status(200).json({
            success: true,
            message: "Product variant deleted successfully",
        });
    }
    catch (error) {
        logger_1.logger.error("Delete product variant error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while deleting product variant",
        });
    }
};
exports.deleteProductVariant = deleteProductVariant;
//# sourceMappingURL=product.controller.js.map