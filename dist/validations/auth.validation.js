"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordValidation = exports.forgotPasswordValidation = exports.loginValidation = exports.registerValidation = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidation = [
    (0, express_validator_1.body)("name")
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 3 })
        .withMessage("Name must be at least 3 characters"),
    (0, express_validator_1.body)("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
    (0, express_validator_1.body)("phone")
        .notEmpty()
        .withMessage("Phone number is required")
        .matches(/^\d{10,12}$/)
        .withMessage("Phone number must be between 10 and 12 digits"),
    (0, express_validator_1.body)("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
];
exports.loginValidation = [
    (0, express_validator_1.body)("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
];
exports.forgotPasswordValidation = [
    (0, express_validator_1.body)("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
];
exports.resetPasswordValidation = [
    (0, express_validator_1.body)("token").notEmpty().withMessage("Token is required"),
    (0, express_validator_1.body)("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
];
//# sourceMappingURL=auth.validation.js.map