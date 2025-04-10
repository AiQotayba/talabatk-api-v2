import mongoose, { type Document, Schema } from "mongoose"

export interface IRestaurant extends Document {
  name: string
  logo: string
  contactInfo: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
    },
    logo: {
      type: String,
      required: [true, "Restaurant logo is required"],
    },
    contactInfo: {
      type: String,
      required: [true, "Contact information is required"],
      trim: true,
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

export default mongoose.model<IRestaurant>("Restaurant", restaurantSchema)
