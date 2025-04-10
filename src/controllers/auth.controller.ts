import type { Request, Response } from "express"
import User from "../models/user.model"
import { generateToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt"
import { logger } from "../utils/logger"

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] })
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "User with this email or phone already exists",
      })
      return
    }

    // Create new user
    const user: any = await User.create({
      name,
      email,
      phone,
      password,
    })

    // Generate tokens
    const token = generateToken(user._id.toString())
    const refreshToken = generateRefreshToken(user._id.toString())

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
    })
  } catch (error) {
    logger.error("Registration error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred during registration",
    })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user: any = await User.findOne({ email }).select("+password")
    if (!user) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Invalid credentials",
      })
      return
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Invalid credentials",
      })
      return
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate tokens
    const token = generateToken(user._id.toString())
    const refreshToken = generateRefreshToken(user._id.toString())

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
    })
  } catch (error) {
    logger.error("Login error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred during login",
    })
  }
}

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "Refresh token is required",
      })
      return
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken)
    if (!decoded) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Invalid or expired refresh token",
      })
      return
    }

    // Generate new tokens
    const token = generateToken(decoded.id)
    const newRefreshToken = generateRefreshToken(decoded.id)

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        token,
        refreshToken: newRefreshToken,
      },
    })
  } catch (error) {
    logger.error("Refresh token error:", error)
    res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "Invalid or expired refresh token",
    })
  }
}

export const logout = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  })
}
