import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../src/config/db.js'
import Category from '../src/models/Category.js'
import Product from '../src/models/Product.js'
import { categories, products } from './seedData.js'

async function seed() {
  await connectDB()
  console.log('[seed] connected, clearing existing categories/products...')

  await Category.deleteMany({})
  await Product.deleteMany({})

  const createdCategories = await Category.insertMany(categories)
  const categoryBySlug = Object.fromEntries(createdCategories.map((c) => [c.slug, c._id]))

  const productDocs = products.map(({ categorySlug, ...p }) => ({
    ...p,
    categoryId: categoryBySlug[categorySlug],
    inventory: { stockQuantity: 100, reorderThreshold: 10 },
  }))
  await Product.insertMany(productDocs)

  console.log(`[seed] inserted ${createdCategories.length} categories, ${productDocs.length} products`)
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
