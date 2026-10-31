import Product from '../models/Product.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const listProducts = asyncHandler(async (req, res) => {
  const { category, origin, minCacao, maxPrice, search, sort } = req.query

  const filter = { isActive: true }
  if (category) filter.productType = category
  if (origin) {
    const origins = Array.isArray(origin) ? origin : String(origin).split(',')
    filter.origin = { $in: origins }
  }
  if (minCacao) filter.cacaoPercentage = { $gte: Number(minCacao) }
  if (maxPrice) filter.price = { ...(filter.price || {}), $lte: Number(maxPrice) }
  if (search) {
    filter.$or = [
      { nameEn: { $regex: search, $options: 'i' } },
      { nameEs: { $regex: search, $options: 'i' } },
      { origin: { $regex: search, $options: 'i' } },
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

  const products = await Product.find(filter).sort(sortSpec)
  res.json({ products })
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
