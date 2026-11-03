import { useMemo, useState } from 'react'
import { Check, Gift } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'
import ProductImage from '../components/common/ProductImage'

const MAX_PIECES = 9

export default function SamplerBuilder() {
  const { t, locale } = useLocale()
  const { addItem, openDrawer } = useCart()
  const { products, loading } = useProducts()
  const [selected, setSelected] = useState([])

  const toggle = (product) => {
    setSelected((prev) => {
      const exists = prev.find((p) => p.id === product.id)
      if (exists) return prev.filter((p) => p.id !== product.id)
      if (prev.length >= MAX_PIECES) return prev
      return [...prev, product]
    })
  }

  const total = useMemo(() => selected.reduce((sum, p) => sum + p.price, 0), [selected])

  const handleAddSampler = () => {
    selected.forEach((product) => addItem(product, 1))
    openDrawer()
  }

  if (loading) {
    return <div className="py-32 text-center text-cacao-500">Loading…</div>
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-2">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gold-600">
          <Gift size={14} /> Build Your Own
        </span>
        <h1 className="font-serif text-3xl font-bold text-cacao-900">{t('sampler_title')}</h1>
        <p className="text-cacao-500">{t('sampler_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_300px]">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {products.map((product) => {
            const name = locale === 'es' ? product.nameEs : product.nameEn
            const isSelected = selected.some((p) => p.id === product.id)
            return (
              <button
                type="button"
                key={product.id}
                aria-pressed={isSelected}
                onClick={() => toggle(product)}
                className={`relative flex flex-col overflow-hidden rounded-2xl border-2 text-left transition ${
                  isSelected ? 'border-cacao-700' : 'border-transparent'
                }`}
              >
                <ProductImage product={product} className="h-28" iconClassName="h-1/2 w-1/2" />
                {isSelected && (
                  <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-cacao-700 text-white">
                    <Check size={14} />
                  </span>
                )}
                <div className="flex flex-col gap-0.5 bg-white p-3">
                  <span className="text-xs font-medium leading-snug text-cacao-800">{name}</span>
                  <span className="text-xs text-cacao-600">${product.price.toFixed(2)}</span>
                </div>
              </button>
            )
          })}
        </div>

        <div className="h-fit rounded-2xl border border-cacao-100 bg-white p-6">
          <h2 className="font-serif text-lg font-semibold text-cacao-900">{t('sampler_review')}</h2>
          <p className="mt-1 text-xs text-cacao-600">
            {selected.length} / {MAX_PIECES} pieces selected
          </p>

          <ul className="mt-4 flex flex-col gap-2">
            {selected.length === 0 ? (
              <li className="text-sm text-cacao-600">Choose pieces to start your sampler.</li>
            ) : (
              selected.map((p) => (
                <li key={p.id} className="flex justify-between text-sm">
                  <span className="text-cacao-700">{locale === 'es' ? p.nameEs : p.nameEn}</span>
                  <span className="text-cacao-500">${p.price.toFixed(2)}</span>
                </li>
              ))
            )}
          </ul>

          <div className="mt-4 flex justify-between border-t border-cacao-100 pt-3 text-sm font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button
            type="button"
            disabled={selected.length === 0}
            onClick={handleAddSampler}
            className="mt-5 w-full rounded-full bg-cacao-700 py-2.5 text-sm font-semibold text-white hover:bg-cacao-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('sampler_add')}
          </button>
        </div>
      </div>
    </div>
  )
}
