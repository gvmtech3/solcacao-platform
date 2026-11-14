import Product from '../models/Product.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const listProducts = asyncHandler(async (req, res) => {
  const { category, origin, minCacao, maxPrice, search, sort } = req.query
  const page = Number(req.query.page ?? 1)
  const limit = Number(req.query.limit ?? 20)
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw ApiError.badRequest('page must be a positive integer and limit must be between 1 and 100.')
  }

  const filter = { isActive: true }
  if (category) filter.productType = category
  if (origin) {
    const origins = Array.isArray(origin) ? origin : String(origin).split(',')
    filter.origin = { $in: origins }
  }
  if (minCacao) filter.cacaoPercentage = { $gte: Number(minCacao) }
  if (maxPrice) filter.price = { ...(filter.price || {}), $lte: Number(maxPrice) }
  if (search) {
    const escapedSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    filter.$or = [
      { nameEn: { $regex: escapedSearch, $options: 'i' } },
      { nameEs: { $regex: escapedSearch, $options: 'i' } },
      { origin: { $regex: escapedSearch, $options: 'i' } },
    ]
  }

  let sortSpec = {}
  switch (sort) {
    case 'price-asc':
      sortSpec = { price: 1 }
      break
    case 'price-desc':
      sortSpec = { price: -1 }
      break
    case 'cacao-desc':
      sortSpec = { cacaoPercentage: -1 }
      break
    default:
      sortSpec = { createdAt: -1 }
  }

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortSpec).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ])
  res.json({ products, total, page, limit, totalPages: Math.ceil(total / limit) })
})

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) throw ApiError.notFound('Product not found.')
  res.json({ product })
})

export const listOrigins = asyncHandler(async (req, res) => {
  const origins = await Product.distinct('origin', { isActive: true })
  res.json({ origins: origins.sort() })
})
