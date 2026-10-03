import { Link } from 'react-router-dom'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useLocale } from '../../context/LocaleContext'
import ProductImage from '../common/ProductImage'
import useEscapeKey from '../../hooks/useEscapeKey'

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, updateQuantity, removeItem, subtotal } = useCart()
  const { locale, t } = useLocale()

  useEscapeKey(isDrawerOpen, closeDrawer)

  if (!isDrawerOpen) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
      <div className="absolute inset-0 bg-cacao-900/40" onClick={closeDrawer} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-cream-50 shadow-xl">
        <div className="flex items-center justify-between border-b border-cacao-100 px-5 py-4">
          <h2 id="cart-drawer-title" className="font-serif text-lg font-semibold">{t('cart_title')}</h2>
          <button type="button" onClick={closeDrawer} aria-label="Close cart" className="p-1 text-cacao-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="mt-8 text-center text-sm text-cacao-500">{t('cart_empty')}</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map(({ product, quantity }) => {
                const name = locale === 'es' ? product.nameEs : product.nameEn
                return (
                  <li key={product.id} className="flex gap-3">
                    <ProductImage product={product} className="h-16 w-16 shrink-0 rounded-xl" iconClassName="h-1/2 w-1/2" />
                    <div className="flex flex-1 flex-col gap-1">
                      <span className="text-sm font-medium leading-snug">{name}</span>
                      <span className="text-xs text-cacao-500">${product.price.toFixed(2)}</span>
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="rounded-full border border-cacao-200 p-1 hover:bg-cacao-100"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-sm">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="rounded-full border border-cacao-200 p-1 hover:bg-cacao-100"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(product.id)}
                          className="ml-auto p-1 text-cacao-400 hover:text-red-500"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-cacao-100 px-5 py-4">
            <div className="mb-3 flex items-center justify-between text-sm font-medium">
              <span>{t('cart_subtotal')}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={closeDrawer}
              className="block w-full rounded-full bg-cacao-700 py-2.5 text-center text-sm font-semibold text-white hover:bg-cacao-600"
            >
              {t('cart_checkout')}
            </Link>
            <button
              type="button"
              onClick={closeDrawer}
              className="mt-2 w-full text-center text-xs font-medium text-cacao-500 hover:text-cacao-700"
            >
              {t('cart_continue_shopping')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
