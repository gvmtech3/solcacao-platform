import Cart from '../models/Cart.js'
import Order from '../models/Order.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { generateOrderNumber } from '../utils/referenceNumbers.js'

export const createOrder = asyncHandler(async (req, res) => {
  const shipping = req.validated

  const cart = await Cart.findOne({ userId: req.user._id, status: 'active' }).populate(
    'items.productId'
  )
  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Your cart is empty.')
  }

  const items = cart.items
    .filter((item) => item.productId)
    .map((item) => ({
      productId: item.productId._id,
      nameEn: item.productId.nameEn,
      nameEs: item.productId.nameEs,
      quantity: item.quantity,
      unitPrice: item.productId.price,
    }))

  const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  const order = await Order.create({
    userId: req.user._id,
    orderNumber: generateOrderNumber(),
    totalAmount,
    items,
    shippingAddress: {
      firstName: shipping.firstName,
      lastName: shipping.lastName,
      addressLine1: shipping.addressLine1,
      city: shipping.city,
      state: shipping.state,
      zipCode: shipping.zipCode,
      country: 'US',
      phone: shipping.phone,
      email: shipping.email,
    },
  })

  cart.items = []
  cart.status = 'converted'
  await cart.save()

  res.status(201).json({ order })
})

export const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({ placedAt: -1 })
  res.json({ orders })
})
