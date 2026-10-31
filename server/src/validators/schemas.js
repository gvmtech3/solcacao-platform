import { z } from 'zod'

const NAME_PATTERN = /^[\p{L}\s'-]+$/u
const STATE_PATTERN = /^[\p{L}\s.'-]+$/u
const PHONE_CHARS_PATTERN = /^\+?[0-9\s().-]+$/

const nameField = (label) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .regex(NAME_PATTERN, `${label} can only contain letters, spaces, hyphens, and apostrophes.`)

const phoneField = z
  .string()
  .trim()
  .min(1, 'Phone number is required.')
  .regex(PHONE_CHARS_PATTERN, 'Phone number contains invalid characters.')
  .refine((v) => {
    const digits = v.replace(/\D/g, '')
    return digits.length >= 7 && digits.length <= 15
  }, 'Phone number must have 7–15 digits.')

const emailField = z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.')

export const registerSchema = z.object({
  firstName: nameField('First name'),
  lastName: z.string().trim().optional().default(''),
  email: emailField,
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  accountType: z.enum(['retail', 'b2b']).default('retail'),
})

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required.'),
})

export const addressSchema = z.object({
  label: z.string().trim().optional(),
  addressLine1: z.string().trim().min(1, 'Address is required.'),
  addressLine2: z.string().trim().optional(),
  city: nameField('City'),
  state: z.string().trim().min(1, 'State/Province is required.').regex(
    STATE_PATTERN,
    'State/Province can only contain letters, spaces, hyphens, periods, and apostrophes.'
  ),
  zipCode: z.string().trim().min(1, 'ZIP code is required.'),
  country: z.string().trim().min(1, 'Country is required.'),
  isDefault: z.boolean().optional(),
})

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
})

export const createOrderSchema = z.object({
  firstName: nameField('First name'),
  lastName: nameField('Last name'),
  email: emailField,
  phone: phoneField,
  addressLine1: z.string().trim().min(1, 'Address is required.'),
  city: nameField('City'),
  state: z.string().trim().min(1, 'State/Province is required.').regex(
    STATE_PATTERN,
    'State/Province can only contain letters, spaces, hyphens, periods, and apostrophes.'
  ),
  zipCode: z.string().trim().min(1, 'ZIP code is required.'),
})

export const contactSchema = z.object({
  name: nameField('Name'),
  email: emailField,
  category: z.enum(['general', 'wholesale', 'support']),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters.'),
})

export const b2bQuoteSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required.'),
  contactName: nameField('Contact name'),
  email: emailField,
  phone: phoneField,
  cacaoProfile: z.string().trim().min(1, 'Cacao profile is required.'),
  estimatedQuantity: z.coerce
    .number()
    .int('Quantity must be a whole number.')
    .min(50, 'Quantity must be at least 50.'),
  packagingPreference: z.string().trim().optional(),
  notes: z.string().trim().optional(),
})

export const accountUpdateSchema = z.object({
  firstName: nameField('First name').optional(),
  lastName: z.string().trim().optional(),
})

export function formatZodError(error) {
  const details = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_'
    if (!details[key]) details[key] = issue.message
  }
  return details
}
