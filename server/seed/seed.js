import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../src/config/db.js'
import Category from '../src/models/Category.js'
import Product from '../src/models/Product.js'

const categories = [
  {
    slug: 'bar',
    nameEn: 'Single-Origin Bars',
    nameEs: 'Barras de Origen Único',
    imageUrl: 'https://images.pexels.com/photos/6167345/pexels-photo-6167345.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'truffle',
    nameEn: 'Artisanal Truffles',
    nameEs: 'Trufas Artesanales',
    imageUrl: 'https://images.pexels.com/photos/352779/pexels-photo-352779.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'seasonal',
    nameEn: 'Seasonal Collections',
    nameEs: 'Colecciones de Temporada',
    imageUrl: 'https://images.pexels.com/photos/11616424/pexels-photo-11616424.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
]

const products = [
  {
    sku: 'SC-BAR-001',
    nameEn: 'Madagascar Single-Origin 72%',
    nameEs: 'Origen Único Madagascar 72%',
    descriptionEn: 'Bright red-fruit notes from Sambirano Valley cacao, stone-ground and slow-conched.',
    descriptionEs: 'Notas brillantes de frutos rojos del cacao del Valle de Sambirano, molido en piedra.',
    productType: 'bar',
    origin: 'Madagascar',
    cacaoPercentage: 72,
    price: 12.5,
    imageUrl: 'https://images.pexels.com/photos/4113364/pexels-photo-4113364.jpeg?auto=compress&cs=tinysrgb&w=800',
    categorySlug: 'bar',
  },
  {
    sku: 'SC-BAR-002',
    nameEn: 'Ecuador Arriba Nacional 85%',
    nameEs: 'Arriba Nacional Ecuador 85%',
    descriptionEn: 'Deep, floral cacao from the Arriba Nacional varietal with a bold, intense finish.',
    descriptionEs: 'Cacao floral y profundo de la variedad Arriba Nacional con final intenso.',
    productType: 'bar',
    origin: 'Ecuador',
    cacaoPercentage: 85,
    price: 13.75,
    imageUrl: 'https://images.pexels.com/photos/6167345/pexels-photo-6167345.jpeg?auto=compress&cs=tinysrgb&w=800',
    categorySlug: 'bar',
  },
  {
    sku: 'SC-BAR-003',
    nameEn: 'Vietnam Mekong Delta 64%',
    nameEs: 'Delta del Mekong Vietnam 64%',
    descriptionEn: 'Silky milk-forward bar with caramel and toasted-nut undertones.',
    descriptionEs: 'Barra sedosa con notas de caramelo y frutos secos tostados.',
    productType: 'bar',
    origin: 'Vietnam',
    cacaoPercentage: 64,
    price: 11.0,
    imageUrl: 'https://images.pexels.com/photos/14456475/pexels-photo-14456475.jpeg?auto=compress&cs=tinysrgb&w=800',
    categorySlug: 'bar',
  },
  {
    sku: 'SC-TRF-001',
    nameEn: 'Sea Salt Caramel Truffle Box',
    nameEs: 'Trufas de Caramelo y Sal Marina',
    descriptionEn: 'Hand-rolled dark chocolate truffles filled with fleur de sel caramel, box of 9.',
    descriptionEs: 'Trufas de chocolate negro rellenas de caramelo y flor de sal, caja de 9.',
    productType: 'truffle',
    origin: 'Peru',
    cacaoPercentage: 70,
    price: 24.0,
    imageUrl: 'https://images.pexels.com/photos/352779/pexels-photo-352779.jpeg?auto=compress&cs=tinysrgb&w=800',
    categorySlug: 'truffle',
  },
  {
    sku: 'SC-TRF-002',
    nameEn: 'Espresso Cacao Truffle Box',
    nameEs: 'Trufas de Café y Cacao',
    descriptionEn: 'Rich espresso ganache enrobed in 70% dark chocolate, box of 9.',
    descriptionEs: 'Ganache de espresso envuelto en chocolate negro al 70%, caja de 9.',
    productType: 'truffle',
    origin: 'Colombia',
    cacaoPercentage: 70,
    price: 24.0,
    imageUrl: 'https://images.pexels.com/photos/3465380/pexels-photo-3465380.jpeg?auto=compress&cs=tinysrgb&w=800',
    categorySlug: 'truffle',
  },
  {
    sku: 'SC-TRF-003',
    nameEn: 'Raspberry Rose Truffle Box',
    nameEs: 'Trufas de Frambuesa y Rosas',
    descriptionEn: 'Delicate raspberry ganache with rose petal dust, box of 9.',
    descriptionEs: 'Ganache de frambuesa con pétalos de rosa, caja de 9.',
    productType: 'truffle',
    origin: 'Dominican Republic',
    cacaoPercentage: 65,
    price: 26.0,
    imageUrl: 'https://images.pexels.com/photos/10313341/pexels-photo-10313341.jpeg?auto=compress&cs=tinysrgb&w=800',
    categorySlug: 'truffle',
  },
  {
    sku: 'SC-SEA-001',
    nameEn: 'Winter Spice Seasonal Bar',
    nameEs: 'Barra de Especias de Invierno',
    descriptionEn: 'Limited-batch dark chocolate infused with cinnamon, clove, and orange peel.',
    descriptionEs: 'Chocolate negro en edición limitada con canela, clavo y cáscara de naranja.',
    productType: 'seasonal',
    origin: 'Peru',
    cacaoPercentage: 68,
    price: 14.5,
    imageUrl: 'https://images.pexels.com/photos/11616424/pexels-photo-11616424.jpeg?auto=compress&cs=tinysrgb&w=800',
    categorySlug: 'seasonal',
  },
  {
    sku: 'SC-SEA-002',
    nameEn: 'Harvest Almond Seasonal Bar',
    nameEs: 'Barra de Almendras de Cosecha',
    descriptionEn: 'Toasted Marcona almonds folded into a 60% single-origin dark chocolate base.',
    descriptionEs: 'Almendras Marcona tostadas en una base de chocolate negro de origen único al 60%.',
    productType: 'seasonal',
    origin: 'Dominican Republic',
    cacaoPercentage: 60,
    price: 13.0,
    imageUrl: 'https://images.pexels.com/photos/1693027/pexels-photo-1693027.jpeg?auto=compress&cs=tinysrgb&w=800',
    categorySlug: 'seasonal',
  },
  {
    sku: 'SC-BAR-004',
    nameEn: 'Ghana Ashanti Gold 55%',
    nameEs: 'Ashanti Gold Ghana 55%',
    descriptionEn: 'A smooth, approachable milk-dark blend with notes of honey and dried fig.',
    descriptionEs: 'Mezcla suave con notas de miel e higo seco.',
    productType: 'bar',
    origin: 'Ghana',
    cacaoPercentage: 55,
    price: 10.5,
    imageUrl: 'https://images.pexels.com/photos/6167333/pexels-photo-6167333.jpeg?auto=compress&cs=tinysrgb&w=800',
    categorySlug: 'bar',
  },
]

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
