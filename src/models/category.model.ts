import mongoose, { type Document, Schema } from "mongoose"

export interface ICategory extends Document {
  name: string
  parent?: mongoose.Types.ObjectId
  showInHomepage: boolean
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    showInHomepage: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<ICategory>("Category", categorySchema)
