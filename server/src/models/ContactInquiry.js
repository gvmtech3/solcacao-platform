import mongoose from 'mongoose'

const { Schema } = mongoose

const contactInquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    category: { type: String, enum: ['general', 'wholesale', 'support'], required: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export default mongoose.model('ContactInquiry', contactInquirySchema)
