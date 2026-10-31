import mongoose from 'mongoose'

const { Schema } = mongoose

const inventorySchema = new Schema(
  {
    stockQuantity: { type: Number, default: 0, min: 0 },
    reorderThreshold: { type: Number, default: 10 },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const productSchema = new Schema(
  {
    nameEn: { type: String, required: true, trim: true },
    nameEs: { type: String, required: true, trim: true },
    descriptionEn: { type: String, trim: true },
    descriptionEs: { type: String, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    cacaoPercentage: { type: Number, required: true, min: 0, max: 100 },
    origin: { type: String, required: true, trim: true },
    productType: { type: String, enum: ['bar', 'truffle', 'seasonal'], required: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    isActive: { type: Boolean, default: true },
    inventory: { type: inventorySchema, default: () => ({}) },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

productSchema.index({ productType: 1, origin: 1, cacaoPercentage: 1, price: 1 })

export default mongoose.model('Product', productSchema)
