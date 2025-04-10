import type { Request, Response } from "express"
import type { AuthRequest } from "../middlewares/auth.middleware"
import Restaurant from "../models/restaurant.model"
import Product from "../models/product.model"
import { logger } from "../utils/logger"

// Get all restaurants
export const getAllRestaurants = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const restaurants = await Restaurant.find({ isActive: true }).skip(skip).limit(limit)

    const total = await Restaurant.countDocuments({ isActive: true })

    res.status(200).json({
      success: true,
      data: {
        restaurants,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    logger.error("Get all restaurants error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching restaurants",
    })
  }
}

// Get restaurant by ID
export const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id, isActive: true })
    if (!restaurant) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Restaurant not found",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: restaurant,
    })
  } catch (error) {
    logger.error("Get restaurant by ID error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching restaurant",
    })
  }
}

// Create restaurant
export const createRestaurant = async (req: AuthRequest, res: Response) => {
  try {
    const { name, logo, contactInfo } = req.body

    const restaurant = await Restaurant.create({
      name,
      logo,
      contactInfo,
      isActive: true,
    })

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      data: restaurant,
    })
  } catch (error) {
    logger.error("Create restaurant error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while creating restaurant",
    })
  }
}

// Update restaurant
export const updateRestaurant = async (req: AuthRequest, res: Response) => {
  try {
    const { name, logo, contactInfo, isActive } = req.body

    const restaurant = await Restaurant.findById(req.params.id)
    if (!restaurant) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Restaurant not found",
      })
      return
    }

    // Update restaurant fields
    if (name) restaurant.name = name
    if (logo) restaurant.logo = logo
    if (contactInfo) restaurant.contactInfo = contactInfo
    if (isActive !== undefined) restaurant.isActive = isActive

    await restaurant.save()

    res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      data: restaurant,
    })
  } catch (error) {
    logger.error("Update restaurant error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while updating restaurant",
    })
  }
}

// Delete restaurant
export const deleteRestaurant = async (req: AuthRequest, res: Response) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
    if (!restaurant) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Restaurant not found",
      })
      return
    }

    // Check if restaurant has products
    const products = await Product.findOne({ "variants.restaurant": req.params.id })
    if (products) {
      res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "Cannot delete restaurant with associated products",
      })
      return
    }

    await restaurant.deleteOne()

    res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully",
    })
  } catch (error) {
    logger.error("Delete restaurant error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while deleting restaurant",
    })
  }
}

// Get products by restaurant
export const getProductsByRestaurant = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const restaurant = await Restaurant.findOne({ _id: req.params.id, isActive: true })
    if (!restaurant) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Restaurant not found",
      })
      return
    }

    // Find products where at least one variant belongs to this restaurant
    const products = await Product.find({
      "variants.restaurant": req.params.id,
      isActive: true,
    })
      .populate("category", "name")
      .skip(skip)
      .limit(limit)

    const total = await Product.countDocuments({
      "variants.restaurant": req.params.id,
      isActive: true,
    })

    res.status(200).json({
      success: true,
      data: {
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
        },
        products,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    logger.error("Get products by restaurant error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching products",
    })
  }
}
