import mongoose from 'mongoose'

const { Schema } = mongoose

const quoteFileSchema = new Schema(
  {
    fileUrl: { type: String, required: true },
    fileType: { type: String },
    originalFilename: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const b2bQuoteRequestSchema = new Schema(
  {
    corporatePartnerUserId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    quoteNumber: { type: String, required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    cacaoProfile: { type: String, required: true },
    estimatedQuantity: { type: Number, required: true, min: 1 },
    packagingPreference: { type: String },
    notes: { type: String },
    files: { type: [quoteFileSchema], default: [] },
    status: {
      type: String,
      enum: ['submitted', 'in_review', 'quoted', 'completed'],
      default: 'submitted',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export default mongoose.model('B2BQuoteRequest', b2bQuoteRequestSchema)
