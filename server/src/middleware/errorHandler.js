import { ApiError } from '../utils/ApiError.js'

export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details })
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field'
    return res.status(409).json({ message: `That ${field} is already in use.` })
  }

  if (err.name === 'MulterError' || /brand asset/i.test(err.message || '')) {
    return res.status(400).json({ message: err.message })
  }

  console.error('[unhandled error]', err)
  res.status(500).json({ message: 'Something went wrong. Please try again.' })
}
