"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsByCategory = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getFeaturedCategories = exports.getCategoryById = exports.getAllCategories = void 0;
const category_model_1 = __importDefault(require("../models/category.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const logger_1 = require("../utils/logger");
// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const categories = await category_model_1.default.find()
            .populate("parent", "name")
            .sort({ displayOrder: 1 })
            .skip(skip)
            .limit(limit);
        const total = await category_model_1.default.countDocuments();
        res.status(200).json({
            success: true,
            data: {
                categories,
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
        logger_1.logger.error("Get all categories error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching categories",
        });
    }
};
exports.getAllCategories = getAllCategories;
// Get category by ID
const getCategoryById = async (req, res) => {
    try {
        const category = await category_model_1.default.findById(req.params.id).populate("parent", "name");
        if (!category) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Category not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: category,
        });
    }
    catch (error) {
        logger_1.logger.error("Get category by ID error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching category",
        });
    }
};
exports.getCategoryById = getCategoryById;
// Get featured categories
const getFeaturedCategories = async (req, res) => {
    try {
        const categories = await category_model_1.default.find({ showInHomepage: true }).sort({ displayOrder: 1 });
        res.status(200).json({
            success: true,
            data: categories,
        });
    }
    catch (error) {
        logger_1.logger.error("Get featured categories error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching featured categories",
        });
    }
};
exports.getFeaturedCategories = getFeaturedCategories;
// Create category
const createCategory = async (req, res) => {
    try {
        const { name, parent, showInHomepage, displayOrder } = req.body;
        // Check if parent category exists if provided
        if (parent) {
            const parentCategory = await category_model_1.default.findById(parent);
            if (!parentCategory) {
                res.status(400).json({
                    success: false,
                    error: "Bad Request",
                    message: "Parent category not found",
                });
                return;
            }
        }
        const category = await category_model_1.default.create({
            name,
            parent,
            showInHomepage: showInHomepage || false,
            displayOrder: displayOrder || 0,
        });
        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });
    }
    catch (error) {
        logger_1.logger.error("Create category error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while creating category",
        });
    }
};
exports.createCategory = createCategory;
// Update category
const updateCategory = async (req, res) => {
    try {
        const { name, parent, showInHomepage, displayOrder } = req.body;
        const category = await category_model_1.default.findById(req.params.id);
        if (!category) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Category not found",
            });
            return;
        }
        // Check if parent category exists if provided
        if (parent) {
            const parentCategory = await category_model_1.default.findById(parent);
            if (!parentCategory) {
                res.status(400).json({
                    success: false,
                    error: "Bad Request",
                    message: "Parent category not found",
                });
                return;
            }
            // Prevent circular reference
            if (parent.toString() === req.params.id) {
                res.status(400).json({
                    success: false,
                    error: "Bad Request",
                    message: "Category cannot be its own parent",
                });
                return;
            }
        }
        // Update category fields
        if (name)
            category.name = name;
        if (parent !== undefined)
            category.parent = parent;
        if (showInHomepage !== undefined)
            category.showInHomepage = showInHomepage;
        if (displayOrder !== undefined)
            category.displayOrder = displayOrder;
        await category.save();
        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category,
        });
    }
    catch (error) {
        logger_1.logger.error("Update category error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while updating category",
        });
    }
};
exports.updateCategory = updateCategory;
// Delete category
const deleteCategory = async (req, res) => {
    try {
        const category = await category_model_1.default.findById(req.params.id);
        if (!category) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Category not found",
            });
            return;
        }
        // Check if category has child categories
        const childCategories = await category_model_1.default.findOne({ parent: req.params.id });
        if (childCategories) {
            res.status(400).json({
                success: false,
                error: "Bad Request",
                message: "Cannot delete category with child categories",
            });
            return;
        }
        // Check if category has products
        const products = await product_model_1.default.findOne({ category: req.params.id });
        if (products) {
            res.status(400).json({
                success: false,
                error: "Bad Request",
                message: "Cannot delete category with associated products",
            });
            return;
        }
        await category.deleteOne();
        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    }
    catch (error) {
        logger_1.logger.error("Delete category error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while deleting category",
        });
    }
};
exports.deleteCategory = deleteCategory;
// Get products by category
const getProductsByCategory = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const category = await category_model_1.default.findById(req.params.id);
        if (!category) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Category not found",
            });
            return;
        }
        const products = await product_model_1.default.find({ category: req.params.id, isActive: true })
            .populate("category", "name")
            .skip(skip)
            .limit(limit);
        const total = await product_model_1.default.countDocuments({ category: req.params.id, isActive: true });
        res.status(200).json({
            success: true,
            data: {
                category: {
                    id: category._id,
                    name: category.name,
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
        logger_1.logger.error("Get products by category error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching products",
        });
    }
};
exports.getProductsByCategory = getProductsByCategory;
//# sourceMappingURL=category.controller.js.map