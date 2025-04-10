import cron from "node-cron"
import Banner from "../models/banner.model"
import { logger } from "../utils/logger"

// Schedule job to run every hour to check banner status
export const scheduleBannerJobs = () => {
  // Run every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    try {
      const currentDate = new Date()
      logger.info("Running banner status update job")

      // Activate banners that should be active
      const activatedBanners = await Banner.updateMany(
        {
          startDate: { $lte: currentDate },
          endDate: { $gte: currentDate },
          isActive: false,
        },
        { isActive: true },
      )

      // Deactivate banners that have expired
      const deactivatedBanners = await Banner.updateMany(
        {
          $or: [{ startDate: { $gt: currentDate } }, { endDate: { $lt: currentDate } }],
          isActive: true,
        },
        { isActive: false },
      )

      logger.info(
        `Banner job completed: Activated ${activatedBanners.modifiedCount} banners, Deactivated ${deactivatedBanners.modifiedCount} banners`,
      )
    } catch (error) {
      logger.error("Banner job error:", error)
    }
  })
}
