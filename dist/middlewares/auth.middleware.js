"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const user_model_1 = __importDefault(require("../models/user.model"));
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                error: "Unauthorized",
                message: "Authentication required",
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: "Unauthorized",
            message: "Invalid or expired token",
        });
    }
};
exports.authenticate = authenticate;
const authorize = (roles) => {
    return async (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Unauthorized",
                message: "Authentication required",
            });
            return;
        }
        const user = await user_model_1.default.findById(req.user.id);
        if (!user) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "User not found",
            });
            return;
        }
        if (!roles.includes(user.role)) {
            res.status(403).json({
                success: false,
                error: "Forbidden",
                message: "You do not have permission to perform this action",
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map