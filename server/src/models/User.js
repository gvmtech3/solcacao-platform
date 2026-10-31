import mongoose from 'mongoose'

const { Schema } = mongoose

const addressSchema = new Schema(
  {
    label: { type: String, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: false }
)

const corporateProfileSchema = new Schema(
  {
    companyName: { type: String, required: true, trim: true },
    taxId: { type: String, trim: true },
    industry: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
  },
  { _id: false }
)

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    accountType: { type: String, enum: ['retail', 'b2b'], default: 'retail' },
    phone: { type: String, trim: true },
    preferredLocale: { type: String, enum: ['en', 'es'], default: 'en' },
    addresses: { type: [addressSchema], default: [] },
    corporateProfile: { type: corporateProfileSchema, default: undefined },
  },
  { timestamps: true }
)

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject({ versionKey: false })
  delete obj.passwordHash
  return obj
}

export default mongoose.model('User', userSchema)
