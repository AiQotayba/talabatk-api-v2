"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.getAllUsers = exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const logger_1 = require("../utils/logger");
const getProfile = async (req, res) => {
    try {
        const user = await user_model_1.default.findById(req.user.id);
        if (!user) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "User not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching profile",
        });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const user = await user_model_1.default.findById(req.user.id);
        if (!user) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "User not found",
            });
            return;
        }
        // Update user fields
        if (name)
            user.name = name;
        if (phone)
            user.phone = phone;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while updating profile",
        });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await user_model_1.default.findById(req.user.id).select("+password");
        if (!user) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "User not found",
            });
            return;
        }
        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            res.status(400).json({
                success: false,
                error: "Bad Request",
                message: "Current password is incorrect",
            });
            return;
        }
        // Update password
        user.password = newPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    }
    catch (error) {
        logger_1.logger.error("Change password error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while changing password",
        });
    }
};
exports.changePassword = changePassword;
const getAllUsers = async (req, res) => {
    console.log("test all users");
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const users = await user_model_1.default.find().select("-password").skip(skip).limit(limit);
        const total = await user_model_1.default.countDocuments();
        res.status(200).json({
            success: true,
            data: {
                users,
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
        logger_1.logger.error("Get all users error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching users",
        });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const user = await user_model_1.default.findById(req.params.id).select("-password");
        if (!user) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "User not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        logger_1.logger.error("Get user by ID error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching user",
        });
    }
};
exports.getUserById = getUserById;
//# sourceMappingURL=user.controller.js.map