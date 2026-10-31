import mongoose from 'mongoose'

const { Schema } = mongoose

const categorySchema = new Schema(
  {
    nameEn: { type: String, required: true, trim: true },
    nameEs: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    imageUrl: { type: String, trim: true },
    parentCategoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  },
  { timestamps: false }
)

export default mongoose.model('Category', categorySchema)
