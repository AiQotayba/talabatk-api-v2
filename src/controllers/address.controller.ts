import type { Response } from "express"
import type { AuthRequest } from "../middlewares/auth.middleware"
import Address from "../models/address.model"
import { logger } from "../utils/logger"

// Get all addresses for the current user
export const getAllAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1 })

    res.status(200).json({
      success: true,
      data: addresses,
    })
  } catch (error) {
    logger.error("Get all addresses error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching addresses",
    })
  }
}

// Get address by ID
export const getAddressById = async (req: AuthRequest, res: Response) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id })
    if (!address) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Address not found",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: address,
    })
  } catch (error) {
    logger.error("Get address by ID error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching address",
    })
  }
}

// Create address
export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { addressLine, city, area, landmark, isDefault } = req.body

    // If this is the default address, unset any existing default
    if (isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false })
    }

    const address = await Address.create({
      user: req.user.id,
      addressLine,
      city,
      area,
      landmark,
      isDefault: isDefault || false,
    })

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: address,
    })
  } catch (error) {
    logger.error("Create address error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while creating address",
    })
  }
}

// Update address
export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { addressLine, city, area, landmark, isDefault } = req.body

    const address = await Address.findOne({ _id: req.params.id, user: req.user.id })
    if (!address) { 
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Address not found",
      })
      return
    }

    // If this is being set as the default address, unset any existing default
    if (isDefault && !address.isDefault) {
      await Address.updateMany({ user: req.user.id, _id: { $ne: address._id } }, { isDefault: false })
    }

    // Update address fields
    if (addressLine) address.addressLine = addressLine
    if (city) address.city = city
    if (area) address.area = area
    if (landmark !== undefined) address.landmark = landmark
    if (isDefault !== undefined) address.isDefault = isDefault

    await address.save()

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address,
    })
  } catch (error) {
    logger.error("Update address error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while updating address",
    })
  }
}

// Delete address
export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id })
    if (!address) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Address not found",
      })
      return
    }

    await address.deleteOne()

    // If the deleted address was the default, set another address as default if available
    if (address.isDefault) {
      const anotherAddress = await Address.findOne({ user: req.user.id })
      if (anotherAddress) {
        anotherAddress.isDefault = true
        await anotherAddress.save()
      }
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    })
  } catch (error) {
    logger.error("Delete address error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while deleting address",
    })
  }
}

// Set address as default
export const setDefaultAddress = async (req: AuthRequest, res: Response) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id })
    if (!address) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Address not found",
      })
      return 
    }

    // Unset any existing default address
    await Address.updateMany({ user: req.user.id, _id: { $ne: address._id } }, { isDefault: false })

    // Set this address as default
    address.isDefault = true
    await address.save()

    res.status(200).json({
      success: true,
      message: "Address set as default successfully",
      data: address,
    })
  } catch (error) {
    logger.error("Set default address error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while setting default address",
    })
  }
}
