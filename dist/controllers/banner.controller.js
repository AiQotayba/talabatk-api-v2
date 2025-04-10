"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBanner = exports.updateBanner = exports.createBanner = exports.getBannerById = exports.getAllBanners = exports.getActiveBanners = void 0;
const banner_model_1 = __importDefault(require("../models/banner.model"));
const logger_1 = require("../utils/logger");
// Get all active banners
const getActiveBanners = async (req, res) => {
    try {
        const currentDate = new Date();
        const banners = await banner_model_1.default.find({
            isActive: true,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
        }).sort({ displayOrder: 1 });
        res.status(200).json({
            success: true,
            data: banners,
        });
    }
    catch (error) {
        logger_1.logger.error("Get active banners error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching banners",
        });
    }
};
exports.getActiveBanners = getActiveBanners;
// Admin: Get all banners
const getAllBanners = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const banners = await banner_model_1.default.find().sort({ displayOrder: 1 }).skip(skip).limit(limit);
        const total = await banner_model_1.default.countDocuments();
        res.status(200).json({
            success: true,
            data: {
                banners,
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
        logger_1.logger.error("Get all banners error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching banners",
        });
    }
};
exports.getAllBanners = getAllBanners;
// Admin: Get banner by ID
const getBannerById = async (req, res) => {
    try {
        const banner = await banner_model_1.default.findById(req.params.id);
        if (!banner) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Banner not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: banner,
        });
    }
    catch (error) {
        logger_1.logger.error("Get banner by ID error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching banner",
        });
    }
};
exports.getBannerById = getBannerById;
// Admin: Create banner
const createBanner = async (req, res) => {
    try {
        const { title, image, linkUrl, displayOrder, startDate, endDate, isActive } = req.body;
        const banner = await banner_model_1.default.create({
            title,
            image,
            linkUrl,
            displayOrder: displayOrder || 0,
            startDate,
            endDate,
            isActive: isActive !== undefined ? isActive : true,
        });
        res.status(201).json({
            success: true,
            message: "Banner created successfully",
            data: banner,
        });
    }
    catch (error) {
        logger_1.logger.error("Create banner error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while creating banner",
        });
    }
};
exports.createBanner = createBanner;
// Admin: Update banner
const updateBanner = async (req, res) => {
    try {
        const { title, image, linkUrl, displayOrder, startDate, endDate, isActive } = req.body;
        const banner = await banner_model_1.default.findById(req.params.id);
        if (!banner) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Banner not found",
            });
            return;
        }
        // Update banner fields
        if (title)
            banner.title = title;
        if (image)
            banner.image = image;
        if (linkUrl)
            banner.linkUrl = linkUrl;
        if (displayOrder !== undefined)
            banner.displayOrder = displayOrder;
        if (startDate)
            banner.startDate = new Date(startDate);
        if (endDate)
            banner.endDate = new Date(endDate);
        if (isActive !== undefined)
            banner.isActive = isActive;
        await banner.save();
        res.status(200).json({
            success: true,
            message: "Banner updated successfully",
            data: banner,
        });
    }
    catch (error) {
        logger_1.logger.error("Update banner error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while updating banner",
        });
    }
};
exports.updateBanner = updateBanner;
// Admin: Delete banner
const deleteBanner = async (req, res) => {
    try {
        const banner = await banner_model_1.default.findById(req.params.id);
        if (!banner) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Banner not found",
            });
            return;
        }
        await banner.deleteOne();
        res.status(200).json({
            success: true,
            message: "Banner deleted successfully",
        });
    }
    catch (error) {
        logger_1.logger.error("Delete banner error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while deleting banner",
        });
    }
};
exports.deleteBanner = deleteBanner;
//# sourceMappingURL=banner.controller.js.map