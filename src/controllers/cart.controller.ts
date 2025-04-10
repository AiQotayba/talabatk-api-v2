import type { Response } from "express"
import type { AuthRequest } from "../middlewares/auth.middleware"
import Cart from "../models/cart.model"
import Product from "../models/product.model"
import { logger } from "../utils/logger"
import mongoose from "mongoose"

// Get cart for current user
export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    let cart: any = await Cart.findOne({ user: req.user.id }).populate({
      path: "items.product",
      select: "name image",
    })

    if (!cart) {
      cart = {
        user: req.user.id,
        items: [],
      }
    }

    res.status(200).json({
      success: true,
      data: cart,
    })
  } catch (error) {
    logger.error("Get cart error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching cart",
    })
  }
}

// Add item to cart
export const addItemToCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, variantId, quantity } = req.body

    // Validate product and variant
    const product = await Product.findOne({ _id: productId, isActive: true })
    if (!product) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Product not found",
      })
      return
    }

    const variant = product.variants.find((v: any) => v._id.toString() === variantId && v.isAvailable)
    if (!variant) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Product variant not found or not available",
      })
      return
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
      })
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.variant.toString() === variantId,
    )

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity
    } else {
      // Add new item if it doesn't exist
      cart.items.push({
        product: new mongoose.Types.ObjectId(productId),
        variant: new mongoose.Types.ObjectId(variantId),
        quantity,
      })
    }

    await cart.save()

    // Populate product details for response
    await cart.populate({
      path: "items.product",
      select: "name image",
    })

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: cart,
    })
  } catch (error) {
    logger.error("Add item to cart error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while adding item to cart",
    })
  }
}

// Update cart item quantity
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { quantity } = req.body

    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Cart not found",
      })
      return
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex((item: any) => item._id.toString() === req.params.itemId)
    if (itemIndex === -1) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Item not found in cart",
      })
      return
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity

    await cart.save()

    // Populate product details for response
    await cart.populate({
      path: "items.product",
      select: "name image",
    })

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: cart,
    })
  } catch (error) {
    logger.error("Update cart item error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while updating cart item",
    })
  }
}

// Remove item from cart
export const removeCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Cart not found",
      })
      return
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex((item: any) => item._id.toString() === req.params.itemId)
    if (itemIndex === -1) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Item not found in cart",
      })
      return
    }

    // Remove item
    cart.items.splice(itemIndex, 1)

    await cart.save()

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: cart,
    })
  } catch (error) {
    logger.error("Remove cart item error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while removing cart item",
    })
  }
}

// Clear cart
export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Cart not found",
      })
      return
    }

    // Clear all items
    cart.items = []

    await cart.save()

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    })
  } catch (error) {
    logger.error("Clear cart error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while clearing cart",
    })
  }
}
