const NAME_PATTERN = /^[\p{L}\s'-]+$/u
const STATE_PATTERN = /^[\p{L}\s.'-]+$/u
const PHONE_CHARS_PATTERN = /^\+?[0-9\s().-]+$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateName(value, fieldLabel = 'This field') {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return `${fieldLabel} is required.`
  if (!NAME_PATTERN.test(trimmed)) {
    return `${fieldLabel} can only contain letters, spaces, hyphens, and apostrophes.`
  }
  return null
}

export function validateCity(value) {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return 'City is required.'
  if (!NAME_PATTERN.test(trimmed)) {
    return 'City can only contain letters, spaces, hyphens, and apostrophes.'
  }
  return null
}

export function validateState(value) {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return 'State/Province is required.'
  if (!STATE_PATTERN.test(trimmed)) {
    return 'State/Province can only contain letters, spaces, hyphens, periods, and apostrophes.'
  }
  return null
}

export function validatePhone(value) {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return 'Phone number is required.'
  if (!PHONE_CHARS_PATTERN.test(trimmed)) return 'Phone number contains invalid characters.'
  const digits = trimmed.replace(/\D/g, '')
  if (digits.length < 7 || digits.length > 15) return 'Phone number must have 7–15 digits.'
  return null
}

export function validateEmail(value) {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return 'Email is required.'
  if (!EMAIL_PATTERN.test(trimmed)) return 'Enter a valid email address.'
  return null
}

export function validateCardNumber(value) {
  const digits = (value ?? '').replace(/[\s-]/g, '')
  if (!digits) return 'Card number is required.'
  if (!/^\d{12,19}$/.test(digits)) return 'Card number must be 12–19 digits.'
  return null
}

export function currentMonthValue() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function validateExpiry(value) {
  if (!value) return 'Expiration date is required.'
  const [year, month] = value.split('-').map(Number)
  if (!year || !month) return 'Enter a valid expiration date.'
  const now = new Date()
  const expiry = new Date(year, month - 1, 1)
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  if (expiry < currentMonthStart) return 'This card has expired.'
  return null
}

export function validateCVC(value) {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return 'CVC is required.'
  if (!/^\d{3,4}$/.test(trimmed)) return 'CVC must be 3 or 4 digits.'
  return null
}

export function validateRequired(value, fieldLabel = 'This field') {
  if (!value || !String(value).trim()) return `${fieldLabel} is required.`
  return null
}

export function validateMessage(value, minLength = 10) {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return 'Message is required.'
  if (trimmed.length < minLength) return `Message must be at least ${minLength} characters.`
  return null
}

export function validateQuantity(value, min = 1) {
  if (value === '' || value === null || value === undefined) return 'Quantity is required.'
  const num = Number(value)
  if (!Number.isFinite(num) || !Number.isInteger(num)) return 'Quantity must be a whole number.'
  if (num < min) return `Quantity must be at least ${min}.`
  return null
}
