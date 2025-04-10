import mongoose, { type Document, Schema } from "mongoose"

export interface IBanner extends Document {
  title: string
  image: string
  linkUrl: string
  displayOrder: number
  startDate: Date
  endDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const bannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Banner image is required"],
    },
    linkUrl: {
      type: String,
      required: [true, "Link URL is required"],
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<IBanner>("Banner", bannerSchema)
