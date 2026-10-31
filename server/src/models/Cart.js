import mongoose from 'mongoose'

const { Schema } = mongoose

const cartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const cartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    guestSessionId: { type: String, default: null },
    status: { type: String, enum: ['active', 'converted', 'abandoned'], default: 'active' },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
)

cartSchema.index({ userId: 1 })
cartSchema.index({ guestSessionId: 1 })

export function findItem(cart, productId) {
  return cart.items.find((item) => item.productId.toString() === productId)
}

export default mongoose.model('Cart', cartSchema)
