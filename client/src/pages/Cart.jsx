import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useLocale } from '../context/LocaleContext'
import ProductImage from '../components/common/ProductImage'

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart()
  const { locale, t } = useLocale()

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-serif text-3xl font-bold text-cacao-900">{t('cart_title')}</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-cacao-100 bg-white p-10">
          <p className="text-cacao-500">{t('cart_empty')}</p>
          <Link
            to="/shop"
            className="rounded-full bg-cacao-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cacao-600"
          >
            {t('cart_continue_shopping')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <ul className="flex flex-col divide-y divide-cacao-100 rounded-2xl border border-cacao-100 bg-white">
            {items.map(({ product, quantity }) => {
              const name = locale === 'es' ? product.nameEs : product.nameEn
              return (
                <li key={product.id} className="flex items-center gap-4 p-5">
                  <ProductImage product={product} className="h-20 w-20 shrink-0 rounded-xl" iconClassName="h-1/2 w-1/2" />
                  <div className="flex flex-1 flex-col gap-1">
                    <Link to={`/product/${product.id}`} className="font-medium hover:text-cacao-600">
                      {name}
                    </Link>
                    <span className="text-sm text-cacao-500">${product.price.toFixed(2)} each</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-cacao-200 px-2 py-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-5 text-center text-sm">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="w-16 text-right text-sm font-semibold">
                    ${(product.price * quantity).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(product.id)}
                    className="p-1 text-cacao-400 hover:text-red-500"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="h-fit rounded-2xl border border-cacao-100 bg-white p-6">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-cacao-500">{t('cart_subtotal')}</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              className="block w-full rounded-full bg-cacao-700 py-2.5 text-center text-sm font-semibold text-white hover:bg-cacao-600"
            >
              {t('cart_checkout')}
            </Link>
            <Link
              to="/shop"
              className="mt-3 block text-center text-xs font-medium text-cacao-500 hover:text-cacao-700"
            >
              {t('cart_continue_shopping')}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
