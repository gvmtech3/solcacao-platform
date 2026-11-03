import Cart, { findItem } from '../models/Cart.js'
import Product from '../models/Product.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

function guestSessionIdFrom(req) {
  return req.header('x-guest-session-id') || null
}

export async function getOrCreateCart(req) {
  if (req.user) {
    let cart = await Cart.findOne({ userId: req.user._id, status: 'active' })
    if (!cart) cart = await Cart.create({ userId: req.user._id })
    return cart
  }

  const guestSessionId = guestSessionIdFrom(req)
  if (!guestSessionId) throw ApiError.badRequest('Missing guest session id.')

  let cart = await Cart.findOne({ guestSessionId, status: 'active' })
  if (!cart) cart = await Cart.create({ guestSessionId })
  return cart
}

async function populateCart(cart) {
  const populated = await cart.populate('items.productId')
  return {
    id: populated._id,
    items: populated.items
      .filter((item) => item.productId)
      .map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      })),
  }
}

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req)
  res.json(await populateCart(cart))
})

export const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body
  if (!productId) throw ApiError.badRequest('productId is required.')

  const product = await Product.findById(productId)
  if (!product) throw ApiError.notFound('Product not found.')

  const cart = await getOrCreateCart(req)
  const existing = findItem(cart, productId)
  if (existing) {
    existing.quantity += Number(quantity) || 1
  } else {
    cart.items.push({ productId, quantity: Number(quantity) || 1 })
  }
  await cart.save()
  res.status(201).json(await populateCart(cart))
})

export const updateItem = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const { quantity } = req.body
  const qty = Number(quantity)
  if (!Number.isInteger(qty) || qty < 1) {
    throw ApiError.badRequest('quantity must be a positive whole number.')
  }

  const cart = await getOrCreateCart(req)
  const item = findItem(cart, productId)
  if (!item) throw ApiError.notFound('Item not in cart.')

  item.quantity = qty
  await cart.save()
  res.json(await populateCart(cart))
})

export const removeItem = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const cart = await getOrCreateCart(req)
  cart.items = cart.items.filter((item) => item.productId.toString() !== productId)
  await cart.save()
  res.json(await populateCart(cart))
})

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req)
  cart.items = []
  await cart.save()
  res.json(await populateCart(cart))
})

export async function mergeGuestCartIntoUser(guestSessionId, userId) {
  if (!guestSessionId) return

  const guestCart = await Cart.findOne({ guestSessionId, status: 'active' })
  if (!guestCart || guestCart.items.length === 0) return

  let userCart = await Cart.findOne({ userId, status: 'active' })
  if (!userCart) userCart = await Cart.create({ userId })

  for (const guestItem of guestCart.items) {
    const existing = findItem(userCart, guestItem.productId.toString())
    if (existing) {
      existing.quantity += guestItem.quantity
    } else {
      userCart.items.push(guestItem)
    }
  }

  await userCart.save()
  guestCart.items = []
  guestCart.status = 'converted'
  await guestCart.save()
}
