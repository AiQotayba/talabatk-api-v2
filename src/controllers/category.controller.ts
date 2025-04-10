import type { Request, Response } from "express"
import type { AuthRequest } from "../middlewares/auth.middleware"
import Category from "../models/category.model"
import Product from "../models/product.model"
import { logger } from "../utils/logger"

// Get all categories
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const categories = await Category.find()
      .populate("parent", "name")
      .sort({ displayOrder: 1 })
      .skip(skip)
      .limit(limit)

    const total = await Category.countDocuments()

    res.status(200).json({
      success: true,
      data: {
        categories,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    logger.error("Get all categories error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching categories",
    })
  }
}

// Get category by ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id).populate("parent", "name")
    if (!category) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Category not found",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: category,
    })
  } catch (error) {
    logger.error("Get category by ID error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching category",
    })
  }
}

// Get featured categories
export const getFeaturedCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ showInHomepage: true }).sort({ displayOrder: 1 })

    res.status(200).json({
      success: true,
      data: categories,
    })
  } catch (error) {
    logger.error("Get featured categories error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching featured categories",
    })
  }
}

// Create category
export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, parent, showInHomepage, displayOrder } = req.body

    // Check if parent category exists if provided
    if (parent) {
      const parentCategory = await Category.findById(parent)
      if (!parentCategory) {
        res.status(400).json({
          success: false,
          error: "Bad Request",
          message: "Parent category not found",
        })
        return
      }
    }

    const category = await Category.create({
      name,
      parent,
      showInHomepage: showInHomepage || false,
      displayOrder: displayOrder || 0,
    })

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    })
  } catch (error) {
    logger.error("Create category error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while creating category",
    })
  }
}

// Update category
export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, parent, showInHomepage, displayOrder } = req.body

    const category = await Category.findById(req.params.id)
    if (!category) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Category not found",
      })
      return
    }

    // Check if parent category exists if provided
    if (parent) {
      const parentCategory = await Category.findById(parent)
      if (!parentCategory) {
        res.status(400).json({
          success: false,
          error: "Bad Request",
          message: "Parent category not found",
        })
        return
      }

      // Prevent circular reference
      if (parent.toString() === req.params.id) {
        res.status(400).json({
          success: false,
          error: "Bad Request",
          message: "Category cannot be its own parent",
        })
        return
      }
    }

    // Update category fields
    if (name) category.name = name
    if (parent !== undefined) category.parent = parent
    if (showInHomepage !== undefined) category.showInHomepage = showInHomepage
    if (displayOrder !== undefined) category.displayOrder = displayOrder

    await category.save()

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    })
  } catch (error) {
    logger.error("Update category error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while updating category",
    })
  }
}

// Delete category
export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Category not found",
      })
      return
    }

    // Check if category has child categories
    const childCategories = await Category.findOne({ parent: req.params.id })
    if (childCategories) {
      res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "Cannot delete category with child categories",
      })
      return
    }

    // Check if category has products
    const products = await Product.findOne({ category: req.params.id })
    if (products) {
      res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "Cannot delete category with associated products",
      })
      return
    }

    await category.deleteOne()

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    })
  } catch (error) {
    logger.error("Delete category error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while deleting category",
    })
  }
}

// Get products by category
export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const category = await Category.findById(req.params.id)
    if (!category) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Category not found",
      })
      return
    }

    const products = await Product.find({ category: req.params.id, isActive: true })
      .populate("category", "name")
      .skip(skip)
      .limit(limit)

    const total = await Product.countDocuments({ category: req.params.id, isActive: true })

    res.status(200).json({
      success: true,
      data: {
        category: {
          id: category._id,
          name: category.name,
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
    logger.error("Get products by category error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching products",
    })
  }
}
