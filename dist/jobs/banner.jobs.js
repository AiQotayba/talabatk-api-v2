"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleBannerJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const banner_model_1 = __importDefault(require("../models/banner.model"));
const logger_1 = require("../utils/logger");
// Schedule job to run every hour to check banner status
const scheduleBannerJobs = () => {
    // Run every hour at minute 0
    node_cron_1.default.schedule("0 * * * *", async () => {
        try {
            const currentDate = new Date();
            logger_1.logger.info("Running banner status update job");
            // Activate banners that should be active
            const activatedBanners = await banner_model_1.default.updateMany({
                startDate: { $lte: currentDate },
                endDate: { $gte: currentDate },
                isActive: false,
            }, { isActive: true });
            // Deactivate banners that have expired
            const deactivatedBanners = await banner_model_1.default.updateMany({
                $or: [{ startDate: { $gt: currentDate } }, { endDate: { $lt: currentDate } }],
                isActive: true,
            }, { isActive: false });
            logger_1.logger.info(`Banner job completed: Activated ${activatedBanners.modifiedCount} banners, Deactivated ${deactivatedBanners.modifiedCount} banners`);
        }
        catch (error) {
            logger_1.logger.error("Banner job error:", error);
        }
    });
};
exports.scheduleBannerJobs = scheduleBannerJobs;
//# sourceMappingURL=banner.jobs.js.map