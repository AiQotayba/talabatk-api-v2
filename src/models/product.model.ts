import mongoose, { type Document, Schema } from "mongoose"

export interface IVariant {
  name: string
  price: number
  restaurant: mongoose.Types.ObjectId
  isAvailable: boolean
}

export interface IProduct extends Document {
  name: string
  description: string
  image: string
  category: mongoose.Types.ObjectId
  isFeatured: boolean
  isActive: boolean
  variants: IVariant[]
  createdAt: Date
  updatedAt: Date
}

const variantSchema = new Schema<IVariant>({
  name: {
    type: String,
    required: [true, "Variant name is required"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
})

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    variants: [variantSchema],
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<IProduct>("Product", productSchema)
