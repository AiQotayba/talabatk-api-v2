import type { Request, Response } from "express"
import type { AuthRequest } from "../middlewares/auth.middleware"
import Product from "../models/product.model"
import Category from "../models/category.model"
import Restaurant from "../models/restaurant.model"
import { logger } from "../utils/logger"
import mongoose from "mongoose"

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const filter: any = { isActive: true }

    // Add category filter if provided
    if (req.query.category) {
      filter.category = req.query.category
    }

    const products = await Product.find(filter).populate("category", "name").skip(skip).limit(limit)

    const total = await Product.countDocuments(filter)

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
    logger.error("Get all products error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching products",
    })
  }
}

// Get featured products
export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true }).populate("category", "name").limit(10)

    res.status(200).json({
      success: true,
      data: products,
    })
  } catch (error) {
    logger.error("Get featured products error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching featured products",
    })
  }
}

// Get product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true }).populate("category", "name")
    if (!product) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Product not found",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: product,
    })
  } catch (error) {
    logger.error("Get product by ID error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching product",
    })
  }
}

// Create product
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, image, category, isFeatured, variants } = req.body

    // Check if category exists
    const categoryExists = await Category.findById(category)
    if (!categoryExists) {
      res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "Category not found",
      })
      return
    }

    // Validate variants if provided
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        // Check if restaurant exists
        const restaurantExists = await Restaurant.findById(variant.restaurant)
        if (!restaurantExists) {
          res.status(400).json({
            success: false,
            error: "Bad Request",
            message: `Restaurant with ID ${variant.restaurant} not found`,
          })
          return
        }
      }
    }

    const product = await Product.create({
      name,
      description,
      image,
      category,
      isFeatured: isFeatured || false,
      isActive: true,
      variants: variants || [],
    })

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    })
  } catch (error) {
    logger.error("Create product error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while creating product",
    })
  }
}

// Update product
export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, image, category, isFeatured, isActive } = req.body

    const product = await Product.findById(req.params.id)
    if (!product) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Product not found",
      })
      return
    }

    // Check if category exists if provided
    if (category) {
      const categoryExists = await Category.findById(category)
      if (!categoryExists) {
        res.status(400).json({
          success: false,
          error: "Bad Request",
          message: "Category not found",
        })
        return
      }
    }

    // Update product fields
    if (name) product.name = name
    if (description) product.description = description
    if (image) product.image = image
    if (category) product.category = new mongoose.Types.ObjectId(category)
    if (isFeatured !== undefined) product.isFeatured = isFeatured
    if (isActive !== undefined) product.isActive = isActive

    await product.save()

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    })
  } catch (error) {
    logger.error("Update product error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while updating product",
    })
  }
}

// Delete product
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Product not found",
      })
      return
    }

    await product.deleteOne()

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    logger.error("Delete product error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while deleting product",
    })
  }
}

// Get product variants
export const getProductVariants = async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true })
    if (!product) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Product not found",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: product.variants,
    })
  } catch (error) {
    logger.error("Get product variants error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching product variants",
    })
  }
}

// Add product variant
export const addProductVariant = async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, restaurant, isAvailable } = req.body

    const product = await Product.findById(req.params.id)
    if (!product) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Product not found",
      })
      return
    }

    // Check if restaurant exists
    const restaurantExists = await Restaurant.findById(restaurant)
    if (!restaurantExists) {
      res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "Restaurant not found",
      })
      return
    }

    // Add new variant
    product.variants.push({
      name,
      price,
      restaurant: new mongoose.Types.ObjectId(restaurant),
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    })

    await product.save()

    res.status(201).json({
      success: true,
      message: "Product variant added successfully",
      data: product.variants[product.variants.length - 1],
    })
  } catch (error) {
    logger.error("Add product variant error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while adding product variant",
    })
  }
}

// Update product variant
export const updateProductVariant = async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, restaurant, isAvailable } = req.body

    const product = await Product.findById(req.params.id)
    if (!product) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Product not found",
      })
      return
    }

    // Find variant by ID
    const variantIndex = product.variants.findIndex((v: any) => v._id.toString() === req.params.variantId)
    if (variantIndex === -1) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Variant not found",
      })
      return
    }

    // Check if restaurant exists if provided
    if (restaurant) {
      const restaurantExists = await Restaurant.findById(restaurant)
      if (!restaurantExists) {
        res.status(400).json({
          success: false,
          error: "Bad Request",
          message: "Restaurant not found",
        })
        return
      }
    }

    // Update variant fields
    if (name) product.variants[variantIndex].name = name
    if (price) product.variants[variantIndex].price = price
    if (restaurant) product.variants[variantIndex].restaurant = new mongoose.Types.ObjectId(restaurant)
    if (isAvailable !== undefined) product.variants[variantIndex].isAvailable = isAvailable

    await product.save()

    res.status(200).json({
      success: true,
      message: "Product variant updated successfully",
      data: product.variants[variantIndex],
    })
  } catch (error) {
    logger.error("Update product variant error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while updating product variant",
    })
  }
}

// Delete product variant
export const deleteProductVariant = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Product not found",
      })
      return
    }

    // Find variant by ID
    const variantIndex = product.variants.findIndex((v: any) => v._id.toString() === req.params.variantId)
    if (variantIndex === -1) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Variant not found",
      })
      return
    }

    // Remove variant
    product.variants.splice(variantIndex, 1)
    await product.save()

    res.status(200).json({
      success: true,
      message: "Product variant deleted successfully",
    })
  } catch (error) {
    logger.error("Delete product variant error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while deleting product variant",
    })
  }
}
