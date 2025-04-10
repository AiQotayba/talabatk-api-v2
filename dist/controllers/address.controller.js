"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaultAddress = exports.deleteAddress = exports.updateAddress = exports.createAddress = exports.getAddressById = exports.getAllAddresses = void 0;
const address_model_1 = __importDefault(require("../models/address.model"));
const logger_1 = require("../utils/logger");
// Get all addresses for the current user
const getAllAddresses = async (req, res) => {
    try {
        const addresses = await address_model_1.default.find({ user: req.user.id }).sort({ isDefault: -1 });
        res.status(200).json({
            success: true,
            data: addresses,
        });
    }
    catch (error) {
        logger_1.logger.error("Get all addresses error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching addresses",
        });
    }
};
exports.getAllAddresses = getAllAddresses;
// Get address by ID
const getAddressById = async (req, res) => {
    try {
        const address = await address_model_1.default.findOne({ _id: req.params.id, user: req.user.id });
        if (!address) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Address not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: address,
        });
    }
    catch (error) {
        logger_1.logger.error("Get address by ID error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while fetching address",
        });
    }
};
exports.getAddressById = getAddressById;
// Create address
const createAddress = async (req, res) => {
    try {
        const { addressLine, city, area, landmark, isDefault } = req.body;
        // If this is the default address, unset any existing default
        if (isDefault) {
            await address_model_1.default.updateMany({ user: req.user.id }, { isDefault: false });
        }
        const address = await address_model_1.default.create({
            user: req.user.id,
            addressLine,
            city,
            area,
            landmark,
            isDefault: isDefault || false,
        });
        res.status(201).json({
            success: true,
            message: "Address created successfully",
            data: address,
        });
    }
    catch (error) {
        logger_1.logger.error("Create address error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while creating address",
        });
    }
};
exports.createAddress = createAddress;
// Update address
const updateAddress = async (req, res) => {
    try {
        const { addressLine, city, area, landmark, isDefault } = req.body;
        const address = await address_model_1.default.findOne({ _id: req.params.id, user: req.user.id });
        if (!address) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Address not found",
            });
            return;
        }
        // If this is being set as the default address, unset any existing default
        if (isDefault && !address.isDefault) {
            await address_model_1.default.updateMany({ user: req.user.id, _id: { $ne: address._id } }, { isDefault: false });
        }
        // Update address fields
        if (addressLine)
            address.addressLine = addressLine;
        if (city)
            address.city = city;
        if (area)
            address.area = area;
        if (landmark !== undefined)
            address.landmark = landmark;
        if (isDefault !== undefined)
            address.isDefault = isDefault;
        await address.save();
        res.status(200).json({
            success: true,
            message: "Address updated successfully",
            data: address,
        });
    }
    catch (error) {
        logger_1.logger.error("Update address error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while updating address",
        });
    }
};
exports.updateAddress = updateAddress;
// Delete address
const deleteAddress = async (req, res) => {
    try {
        const address = await address_model_1.default.findOne({ _id: req.params.id, user: req.user.id });
        if (!address) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Address not found",
            });
            return;
        }
        await address.deleteOne();
        // If the deleted address was the default, set another address as default if available
        if (address.isDefault) {
            const anotherAddress = await address_model_1.default.findOne({ user: req.user.id });
            if (anotherAddress) {
                anotherAddress.isDefault = true;
                await anotherAddress.save();
            }
        }
        res.status(200).json({
            success: true,
            message: "Address deleted successfully",
        });
    }
    catch (error) {
        logger_1.logger.error("Delete address error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while deleting address",
        });
    }
};
exports.deleteAddress = deleteAddress;
// Set address as default
const setDefaultAddress = async (req, res) => {
    try {
        const address = await address_model_1.default.findOne({ _id: req.params.id, user: req.user.id });
        if (!address) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Address not found",
            });
            return;
        }
        // Unset any existing default address
        await address_model_1.default.updateMany({ user: req.user.id, _id: { $ne: address._id } }, { isDefault: false });
        // Set this address as default
        address.isDefault = true;
        await address.save();
        res.status(200).json({
            success: true,
            message: "Address set as default successfully",
            data: address,
        });
    }
    catch (error) {
        logger_1.logger.error("Set default address error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "An error occurred while setting default address",
        });
    }
};
exports.setDefaultAddress = setDefaultAddress;
//# sourceMappingURL=address.controller.js.map