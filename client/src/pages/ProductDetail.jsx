import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Minus, Plus } from 'lucide-react'
import { products } from '../data/products'
import { useLocale } from '../context/LocaleContext'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/common/ProductCard'
import ProductImage from '../components/common/ProductImage'
import NotFound from './NotFound'

export default function ProductDetail() {
  const { id } = useParams()
  const { locale, t } = useLocale()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)

  const product = products.find((p) => String(p.id) === id)
  if (!product) return <NotFound />

  const name = locale === 'es' ? product.nameEs : product.nameEn
  const description = locale === 'es' ? product.descriptionEs : product.descriptionEn
  const related = products.filter((p) => p.id !== product.id && p.productType === product.productType).slice(0, 3)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-cacao-500">
        <Link to="/shop" className="hover:text-cacao-800">
          {t('nav_shop')}
        </Link>{' '}
        / <span className="text-cacao-800">{name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductImage product={product} className="aspect-square rounded-3xl" />


        <div className="flex flex-col gap-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-gold-600">
            {product.origin} · {product.cacaoPercentage}% Cacao · SKU {product.sku}
          </span>
          <h1 className="font-serif text-3xl font-bold text-cacao-900">{name}</h1>
          <p className="text-cacao-600">{description}</p>
          <span className="text-2xl font-semibold text-cacao-900">${product.price.toFixed(2)}</span>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-cacao-200 px-3 py-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="w-4 text-center text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => addItem(product, quantity)}
              className="flex-1 rounded-full bg-cacao-700 py-3 text-sm font-semibold text-white hover:bg-cacao-600"
            >
              {t('add_to_cart')}
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-serif text-2xl font-bold text-cacao-900">You may also like</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
