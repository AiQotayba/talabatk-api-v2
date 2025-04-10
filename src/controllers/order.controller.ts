import type { Response } from "express"
import type { AuthRequest } from "../middlewares/auth.middleware"
import Order from "../models/order.model"
import Cart from "../models/cart.model"
import Product from "../models/product.model"
import Address from "../models/address.model"
import { logger } from "../utils/logger"
import mongoose from "mongoose"

// Get all orders for current user
export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const orders = await Order.find({ user: req.user.id })
      .populate("address", "addressLine city area")
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Order.countDocuments({ user: req.user.id })

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    logger.error("Get user orders error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching orders",
    })
  }
}

// Get order by ID
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
      .populate("address", "addressLine city area")
      .populate("items.product", "name image")

    if (!order) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Order not found",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: order,
    })
  } catch (error) {
    logger.error("Get order by ID error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching order",
    })
  }
}

// Create order from cart
export const createOrder = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { addressId, paymentMethod } = req.body

    // Check if address exists
    const address = await Address.findOne({ _id: addressId, user: req.user.id })
    if (!address) {
      await session.abortTransaction()
      session.endSession()
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Address not found",
      })
      return
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart || cart.items.length === 0) {
      await session.abortTransaction()
      session.endSession()
      res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "Cart is empty",
      })
      return
    }

    // Calculate order items and total amount
    const orderItems = []
    let totalAmount = 0

    for (const item of cart.items) {
      const product = await Product.findById(item.product)
      if (!product || !product.isActive) {
        await session.abortTransaction()
        session.endSession()
        res.status(400).json({
          success: false,
          error: "Bad Request",
          message: `Product ${item.product} is not available`,
        })
        return
      }

      const variant = product.variants.find((v: any) => v._id.toString() === item.variant.toString() && v.isAvailable)
      if (!variant) {
        await session.abortTransaction()
        session.endSession()
        res.status(400).json({
          success: false,
          error: "Bad Request",
          message: `Variant for product ${product.name} is not available`,
        })
        return
      }

      const subtotal = variant.price * item.quantity
      totalAmount += subtotal

      orderItems.push({
        product: item.product,
        variant: item.variant,
        quantity: item.quantity,
        unitPrice: variant.price,
        subtotal,
      })
    }

    // Create order
    const order = await Order.create({
      user: req.user.id,
      address: addressId,
      items: orderItems,
      totalAmount,
      status: "pending",
      paymentMethod,
      paymentStatus: paymentMethod === "cash" ? "pending" : "paid",
      orderDate: new Date(),
    })

    // Clear cart after successful order
    cart.items = []
    await cart.save({ session })

    await session.commitTransaction()
    session.endSession()

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    logger.error("Create order error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while creating order",
    })
  }
}

// Cancel order
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
    if (!order) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Order not found",
      })
      return
    }

    // Check if order can be cancelled
    if (order.status !== "pending" && order.status !== "processing") {
      res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "Order cannot be cancelled at this stage",
      })
      return
    }

    // Update order status
    order.status = "cancelled"
    await order.save()

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    })
  } catch (error) {
    logger.error("Cancel order error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while cancelling order",
    })
  }
}

// Admin: Get all orders
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const status = req.query.status as string
    const filter: any = {}
    if (status) {
      filter.status = status
    }

    const orders = await Order.find(filter)
      .populate("user", "name email phone")
      .populate("address", "addressLine city area")
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Order.countDocuments(filter)

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    logger.error("Get all orders error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching orders",
    })
  }
}

// Admin: Update order status
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status, paymentStatus } = req.body

    const order = await Order.findById(req.params.id)
    if (!order) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Order not found",
      })
      return
    }

    // Update order status
    if (status) {
      order.status = status
    }

    // Update payment status
    if (paymentStatus) {
      order.paymentStatus = paymentStatus
    }

    await order.save()

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    })
  } catch (error) {
    logger.error("Update order status error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while updating order status",
    })
  }
}
