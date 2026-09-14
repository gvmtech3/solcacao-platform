import { Link } from 'react-router-dom'
import { useLocale } from '../../context/LocaleContext'
import { useCart } from '../../context/CartContext'

export default function ProductCard({ product }) {
  const { locale, t } = useLocale()
  const { addItem } = useCart()

  const name = locale === 'es' ? product.nameEs : product.nameEn

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-cacao-100 bg-white shadow-sm transition hover:shadow-md">
      <Link to={`/product/${product.id}`} className="block">
        <div
          className={`flex h-48 items-center justify-center bg-gradient-to-br ${product.swatch} text-cream-50`}
        >
          <span className="font-serif text-4xl font-semibold opacity-90">
            {name.charAt(0)}
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-gold-600">
          {product.origin} · {product.cacaoPercentage}%
        </span>
        <Link to={`/product/${product.id}`} className="font-serif text-lg leading-snug hover:text-cacao-600">
          {name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-semibold">${product.price.toFixed(2)}</span>
          <button
            type="button"
            onClick={() => addItem(product, 1)}
            className="rounded-full bg-cacao-700 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-cacao-600"
          >
            {t('add_to_cart')}
          </button>
        </div>
      </div>
    </div>
  )
}
