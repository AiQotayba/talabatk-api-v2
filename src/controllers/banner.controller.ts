import type { Request, Response } from "express"
import type { AuthRequest } from "../middlewares/auth.middleware"
import Banner from "../models/banner.model"
import { logger } from "../utils/logger"

// Get all active banners
export const getActiveBanners = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date()

    const banners = await Banner.find({
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    }).sort({ displayOrder: 1 })

    res.status(200).json({
      success: true,
      data: banners,
    })
  } catch (error) {
    logger.error("Get active banners error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching banners",
    })
  }
}

// Admin: Get all banners
export const getAllBanners = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const banners = await Banner.find().sort({ displayOrder: 1 }).skip(skip).limit(limit)

    const total = await Banner.countDocuments()

    res.status(200).json({
      success: true,
      data: {
        banners,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    logger.error("Get all banners error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching banners",
    })
  }
}

// Admin: Get banner by ID
export const getBannerById = async (req: AuthRequest, res: Response) => {
  try {
    const banner: any = await Banner.findById(req.params.id)
    if (!banner) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Banner not found",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: banner,
    })
  } catch (error) {
    logger.error("Get banner by ID error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while fetching banner",
    })
  }
}

// Admin: Create banner
export const createBanner = async (req: AuthRequest, res: Response) => {
  try {
    const { title, image, linkUrl, displayOrder, startDate, endDate, isActive } = req.body

    const banner = await Banner.create({
      title,
      image,
      linkUrl,
      displayOrder: displayOrder || 0,
      startDate,
      endDate,
      isActive: isActive !== undefined ? isActive : true,
    })

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    })
  } catch (error) {
    logger.error("Create banner error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while creating banner",
    })
  }
}

// Admin: Update banner
export const updateBanner = async (req: AuthRequest, res: Response) => {
  try {
    const { title, image, linkUrl, displayOrder, startDate, endDate, isActive } = req.body

    const banner = await Banner.findById(req.params.id)
    if (!banner) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Banner not found",
      })
      return
    }

    // Update banner fields
    if (title) banner.title = title
    if (image) banner.image = image
    if (linkUrl) banner.linkUrl = linkUrl
    if (displayOrder !== undefined) banner.displayOrder = displayOrder
    if (startDate) banner.startDate = new Date(startDate)
    if (endDate) banner.endDate = new Date(endDate)
    if (isActive !== undefined) banner.isActive = isActive

    await banner.save()

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    })
  } catch (error) {
    logger.error("Update banner error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while updating banner",
    })
  }
}

// Admin: Delete banner
export const deleteBanner = async (req: AuthRequest, res: Response) => {
  try {
    const banner = await Banner.findById(req.params.id)
    if (!banner) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Banner not found",
      })
      return
    }

    await banner.deleteOne()

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    })
  } catch (error) {
    logger.error("Delete banner error:", error)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An error occurred while deleting banner",
    })
  }
}
