import mongoose from 'mongoose'

const { Schema } = mongoose

const addressSnapshotSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    addressLine1: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String,
    email: String,
  },
  { _id: false }
)

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    nameEn: String,
    nameEs: String,
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    orderNumber: { type: String, required: true, unique: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: { type: addressSnapshotSchema, required: true },
    items: { type: [orderItemSchema], required: true, validate: (v) => v.length > 0 },
    placedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

export default mongoose.model('Order', orderSchema)
