import type { Response } from "express"
import type { AuthRequest } from "../middlewares/auth.middleware"
import User from "../models/user.model"
import { logger } from "../utils/logger"

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "User not found",
      })
      return
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
    })
  } catch (error) {
    logger.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching profile",
    })
  }
}

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone } = req.body

    const user = await User.findById(req.user.id)
    if (!user) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "User not found",
      })
      return
    }

    // Update user fields
    if (name) user.name = name
    if (phone) user.phone = phone

    await user.save()

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
    })
  } catch (error) {
    logger.error("Update profile error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while updating profile",
    })
  }
}

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user.id).select("+password")
    if (!user) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "User not found",
      })
      return
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "Current password is incorrect",
      })
      return
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    logger.error("Change password error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while changing password",
    })
  }
}

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  console.log("test all users")
  
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const users = await User.find().select("-password").skip(skip).limit(limit)

    const total = await User.countDocuments()

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
    })
  } catch (error) {
    logger.error("Get all users error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching users",
    })
  }
}

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "User not found",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    logger.error("Get user by ID error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching user",
    })
  }
}
