import mongoose from 'mongoose'

const { Schema } = mongoose

const samplerItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
)

const customSamplerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    guestSessionId: { type: String, default: null },
    samplerName: { type: String, trim: true },
    items: { type: [samplerItemSchema], required: true, validate: (v) => v.length > 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export default mongoose.model('CustomSampler', customSamplerSchema)
