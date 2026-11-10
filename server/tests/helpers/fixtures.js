import Category from '../../src/models/Category.js'
import Product from '../../src/models/Product.js'

export async function createCategory(overrides = {}) {
  return Category.create({
    nameEn: 'Single-Origin Bars',
    nameEs: 'Barras de Origen Único',
    slug: `bar-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...overrides,
  })
}

export async function createProduct(overrides = {}) {
  const sku = `SC-TEST-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  return Product.create({
    nameEn: 'Test Bar',
    nameEs: 'Barra de Prueba',
    descriptionEn: 'A test product.',
    descriptionEs: 'Un producto de prueba.',
    sku,
    cacaoPercentage: 70,
    origin: 'Peru',
    productType: 'bar',
    price: 12.5,
    isActive: true,
    inventory: { stockQuantity: 100, reorderThreshold: 10 },
    ...overrides,
  })
}
