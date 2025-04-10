"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../utils/logger");
const register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        // Check if user already exists
        const existingUser = await user_model_1.default.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            res.status(400).json({
                success: false,
                error: "Bad Request",
                message: "User with this email or phone already exists",
            });
            return;
        }
        // Create new user
        const user = await user_model_1.default.create({
            name,
            email,
            phone,
            password,
        });
        // Generate tokens
        const token = (0, jwt_1.generateToken)(user._id.toString());
        const refreshToken = (0, jwt_1.generateRefreshToken)(user._id.toString());
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                },
                token,
                refreshToken,
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Registration error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred during registration",
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await user_model_1.default.findOne({ email }).select("+password");
        if (!user) {
            res.status(401).json({
                success: false,
                error: "Unauthorized",
                message: "Invalid credentials",
            });
            return;
        }
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                error: "Unauthorized",
                message: "Invalid credentials",
            });
            return;
        }
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        // Generate tokens
        const token = (0, jwt_1.generateToken)(user._id.toString());
        const refreshToken = (0, jwt_1.generateRefreshToken)(user._id.toString());
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                },
                token,
                refreshToken,
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Login error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred during login",
        });
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({
                success: false,
                error: "Bad Request",
                message: "Refresh token is required",
            });
            return;
        }
        // Verify refresh token
        const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        if (!decoded) {
            res.status(401).json({
                success: false,
                error: "Unauthorized",
                message: "Invalid or expired refresh token",
            });
            return;
        }
        // Generate new tokens
        const token = (0, jwt_1.generateToken)(decoded.id);
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(decoded.id);
        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: {
                token,
                refreshToken: newRefreshToken,
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Refresh token error:", error);
        res.status(401).json({
            success: false,
            error: "Unauthorized",
            message: "Invalid or expired refresh token",
        });
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};
exports.logout = logout;
//# sourceMappingURL=auth.controller.js.map