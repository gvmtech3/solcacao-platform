import Category from '../src/models/Category.js'
import Product from '../src/models/Product.js'
import { categories, products } from './seedData.js'

/**
 * Idempotent seed: only inserts if the products collection is empty, so it's
 * safe to call on every server start without wiping carts/orders that
 * reference existing product ids.
 */
export async function ensureSeedData() {
  const existingCount = await Product.countDocuments()
  if (existingCount > 0) {
    console.log(`[seed] ${existingCount} products already present, skipping auto-seed`)
    return
  }

  console.log('[seed] no products found, seeding categories + products...')

  const createdCategories = await Category.insertMany(categories)
  const categoryBySlug = Object.fromEntries(createdCategories.map((c) => [c.slug, c._id]))

  const productDocs = products.map(({ categorySlug, ...p }) => ({
    ...p,
    categoryId: categoryBySlug[categorySlug],
    inventory: { stockQuantity: 100, reorderThreshold: 10 },
  }))
  await Product.insertMany(productDocs)

  console.log(`[seed] inserted ${createdCategories.length} categories, ${productDocs.length} products`)
}
