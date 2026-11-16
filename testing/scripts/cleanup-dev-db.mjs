// Cleans up test data created by ui-test-suite.mjs and performance-test.mjs in
// the DEV database, and resets product stock back to the seed baseline
// (stockQuantity: 100) since real orders placed during the perf test
// decremented it via the real $inc order-placement path.
//
// Only removes documents matching known test-data patterns created by our own
// scripts (emails prefixed ui_/perf_, checkout firstName Playwright/Perf,
// guest-session ids prefixed ui-/perf-). Does not touch the seeded catalog
// (categories/products) beyond restoring their stock levels, and never
// touches carts/orders/users that don't match those patterns.
//
// NOTE: this script must be run with `server/`'s node_modules on the
// resolution path (mongoose + dotenv live there, not in testing/), e.g.:
//   cp scripts/cleanup-dev-db.mjs ../server/_cleanup-tmp.mjs && \
//   (cd ../server && node _cleanup-tmp.mjs) && rm ../server/_cleanup-tmp.mjs
//
// Run with: node scripts/cleanup-dev-db.mjs (from inside server/, see above)

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const TEST_EMAIL_PATTERNS = [/^ui_/, /^perf_/]
const TEST_GUEST_PREFIXES = ['ui-', 'perf-']
const TEST_FIRST_NAMES = ['Playwright', 'Perf']

async function main() {
  await mongoose.connect(process.env.MONGO_URI)
  const db = mongoose.connection.db
  console.log(`Connected to ${mongoose.connection.name}`)

  const Users = db.collection('users')
  const Carts = db.collection('carts')
  const Orders = db.collection('orders')
  const Quotes = db.collection('quotes')
  const Products = db.collection('products')
  const Categories = db.collection('categories')

  // --- find test users by email pattern ---
  const testUsers = await Users.find({
    $or: TEST_EMAIL_PATTERNS.map((re) => ({ email: { $regex: re } })),
  }).toArray()
  const testUserIds = testUsers.map((u) => u._id)
  console.log(`Found ${testUsers.length} test user accounts`)

  // --- carts: by test userId OR guestSessionId prefix ---
  const cartGuestFilter = {
    $or: [
      { userId: { $in: testUserIds } },
      ...TEST_GUEST_PREFIXES.map((p) => ({ guestSessionId: { $regex: `^${p}` } })),
    ],
  }
  const cartDel = await Carts.deleteMany(cartGuestFilter)
  console.log(`Deleted ${cartDel.deletedCount} carts`)
  console.log(
    'NOTE: ui-test-suite.mjs drives a real browser, so some guest carts it ' +
      'creates get a real crypto-random guestSessionId (no "ui-" prefix) ' +
      'instead of a scripted one. Those are not caught by the regex above; ' +
      'review carts created during the test run window and remove any ' +
      'leftover empty ones by _id if needed.'
  )

  // --- orders: by test userId OR shippingAddress email/firstName pattern ---
  // (Order has no guestSessionId field; it snapshots the shipping address.)
  const orderFilter = {
    $or: [
      { userId: { $in: testUserIds } },
      { 'shippingAddress.email': { $regex: /^(ui_|perf_)/ } },
      { 'shippingAddress.firstName': { $in: TEST_FIRST_NAMES } },
    ],
  }
  const orderDel = await Orders.deleteMany(orderFilter)
  console.log(`Deleted ${orderDel.deletedCount} orders`)

  // --- b2b quotes: by test userId ---
  const quoteDel = await Quotes.deleteMany({ userId: { $in: testUserIds } }).catch(() => ({ deletedCount: 0 }))
  console.log(`Deleted ${quoteDel.deletedCount ?? 0} quotes`)

  // --- users themselves ---
  const userDel = await Users.deleteMany({ _id: { $in: testUserIds } })
  console.log(`Deleted ${userDel.deletedCount} test users`)

  // --- restore seed stock baseline on all products ---
  const stockReset = await Products.updateMany(
    {},
    { $set: { 'inventory.stockQuantity': 100, 'inventory.reorderThreshold': 10 } }
  )
  console.log(`Reset stock to 100 on ${stockReset.modifiedCount} products`)

  // --- sanity check: catalog intact ---
  const productCount = await Products.countDocuments()
  const categoryCount = await Categories.countDocuments()
  const remainingUsers = await Users.countDocuments()
  const remainingCarts = await Carts.countDocuments()
  const remainingOrders = await Orders.countDocuments()
  console.log('\n--- Post-cleanup state ---')
  console.log(`Products: ${productCount} (expect 9)`)
  console.log(`Categories: ${categoryCount} (expect 3)`)
  console.log(`Remaining users: ${remainingUsers}`)
  console.log(`Remaining carts: ${remainingCarts}`)
  console.log(`Remaining orders: ${remainingOrders}`)

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('Cleanup failed:', err)
  process.exit(1)
})
