import type { Request, Response } from "express"
import Product from "../models/product.model"
import Restaurant from "../models/restaurant.model"
import Category from "../models/category.model"
import { logger } from "../utils/logger"

// Search products, restaurants, and categories
export const search = async (req: Request, res: Response) => {
  try {
    const { query, type } = req.query
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    if (!query || query === "") {
      res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "Search query is required",
      })
      return
    }

    const searchQuery = { $regex: query, $options: "i" }

    let results: any = {}
    let total = 0

    // Search by specific type if provided
    if (type) {
      switch (type) {
        case "products":
          results.products = await Product.find({ name: searchQuery, isActive: true })
            .populate("category", "name")
            .skip(skip)
            .limit(limit)
          total = await Product.countDocuments({ name: searchQuery, isActive: true })
          break
        case "restaurants":
          results.restaurants = await Restaurant.find({ name: searchQuery, isActive: true }).skip(skip).limit(limit)
          total = await Restaurant.countDocuments({ name: searchQuery, isActive: true })
          break
        case "categories":
          results.categories = await Category.find({ name: searchQuery }).skip(skip).limit(limit)
          total = await Category.countDocuments({ name: searchQuery })
          break
        default:
          res.status(400).json({
            success: false,
            error: "Bad Request",
            message: "Invalid search type",
          })
          return
      }
    } else {
      // Search all types if no specific type provided
      const [products, restaurants, categories] = await Promise.all([
        Product.find({ name: searchQuery, isActive: true }).populate("category", "name").limit(5),
        Restaurant.find({ name: searchQuery, isActive: true }).limit(5),
        Category.find({ name: searchQuery }).limit(5),
      ])

      results = {
        products,
        restaurants,
        categories,
      }

      // For pagination, we'll use the total count of all types combined
      total = await Product.countDocuments({ name: searchQuery, isActive: true })
      total += await Restaurant.countDocuments({ name: searchQuery, isActive: true })
      total += await Category.countDocuments({ name: searchQuery })
    }

    res.status(200).json({
      success: true,
      data: {
        results,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    logger.error("Search error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while searching",
    })
  }
}

// Search products
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { query, category } = req.query
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    if (!query || query === "") {
      res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "Search query is required",
      })
      return
    }

    const searchQuery: any = { name: { $regex: query, $options: "i" }, isActive: true }

    // Add category filter if provided
    if (category) {
      searchQuery.category = category
    }

    const products = await Product.find(searchQuery).populate("category", "name").skip(skip).limit(limit)

    const total = await Product.countDocuments(searchQuery)

    res.status(200).json({
      success: true,
      data: {
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
    logger.error("Search products error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while searching products",
    })
  }
}

// Search restaurants
export const searchRestaurants = async (req: Request, res: Response) => {
  try {
    const { query } = req.query
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    if (!query || query === "") {
      res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "Search query is required",
      })
      return
    }

    const searchQuery = { name: { $regex: query, $options: "i" }, isActive: true }

    const restaurants = await Restaurant.find(searchQuery).skip(skip).limit(limit)

    const total = await Restaurant.countDocuments(searchQuery)

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
    logger.error("Search restaurants error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while searching restaurants",
    })
  }
}
