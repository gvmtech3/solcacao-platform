import { ApiError } from '../utils/ApiError.js'
import { formatZodError } from '../validators/schemas.js'

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return next(ApiError.badRequest('Validation failed.', formatZodError(result.error)))
    }
    req.validated = result.data
    next()
  }
}
