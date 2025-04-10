"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyToken = exports.generateRefreshToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const generateToken = (userId) => {
    const options = {
        expiresIn: config_1.config.jwtExpiresIn
    };
    return jsonwebtoken_1.default.sign({ id: userId }, config_1.config.jwtSecret, options);
};
exports.generateToken = generateToken;
const generateRefreshToken = (userId) => {
    const options = {
        expiresIn: config_1.config.jwtRefreshExpiresIn
    };
    return jsonwebtoken_1.default.sign({ id: userId }, config_1.config.jwtRefreshSecret, options);
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
    }
    catch (error) {
        throw new Error("Invalid token");
    }
};
exports.verifyToken = verifyToken;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, config_1.config.jwtRefreshSecret);
    }
    catch (error) {
        throw new Error("Invalid refresh token");
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=jwt.js.map