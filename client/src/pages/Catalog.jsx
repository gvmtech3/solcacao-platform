import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'
import { products, origins } from '../data/products'
import { categories } from '../data/categories'
import ProductCard from '../components/common/ProductCard'
import useEscapeKey from '../hooks/useEscapeKey'

const SORT_OPTIONS = [
  { value: 'featured', labelEn: 'Featured', labelEs: 'Destacados' },
  { value: 'price-asc', labelEn: 'Price: Low to High', labelEs: 'Precio: Menor a Mayor' },
  { value: 'price-desc', labelEn: 'Price: High to Low', labelEs: 'Precio: Mayor a Menor' },
  { value: 'cacao-desc', labelEn: 'Cacao %: High to Low', labelEs: '% Cacao: Mayor a Menor' },
]

export default function Catalog() {
  const { t, locale } = useLocale()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'all'

  const [selectedOrigins, setSelectedOrigins] = useState([])
  const [cacaoRange, setCacaoRange] = useState(40)
  const [maxPrice, setMaxPrice] = useState(30)
  const [sort, setSort] = useState('featured')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEscapeKey(filtersOpen, () => setFiltersOpen(false))

  const toggleOrigin = (origin) => {
    setSelectedOrigins((prev) =>
      prev.includes(origin) ? prev.filter((o) => o !== origin) : [...prev, origin]
    )
  }

  const clearFilters = () => {
    setSelectedOrigins([])
    setCacaoRange(40)
    setMaxPrice(30)
    setSearchParams({})
  }

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.cacaoPercentage >= cacaoRange && p.price <= maxPrice)
    if (activeCategory !== 'all') list = list.filter((p) => p.productType === activeCategory)
    if (selectedOrigins.length > 0) list = list.filter((p) => selectedOrigins.includes(p.origin))

    switch (sort) {
      case 'price-asc':
        return [...list].sort((a, b) => a.price - b.price)
      case 'price-desc':
        return [...list].sort((a, b) => b.price - a.price)
      case 'cacao-desc':
        return [...list].sort((a, b) => b.cacaoPercentage - a.cacaoPercentage)
      default:
        return list
    }
  }, [activeCategory, selectedOrigins, cacaoRange, maxPrice, sort])

  const FilterPanel = (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="mb-3 text-sm font-semibold text-cacao-800">Collection</h2>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setSearchParams({})}
            className={`text-left text-sm ${
              activeCategory === 'all' ? 'font-semibold text-cacao-900' : 'text-cacao-500'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSearchParams({ category: cat.slug })}
              className={`text-left text-sm ${
                activeCategory === cat.slug ? 'font-semibold text-cacao-900' : 'text-cacao-500'
              }`}
            >
              {locale === 'es' ? cat.nameEs : cat.nameEn}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-cacao-800">{t('filter_origin')}</h2>
        <div className="flex flex-col gap-2">
          {origins.map((origin) => (
            <label key={origin} className="flex items-center gap-2 text-sm text-cacao-600">
              <input
                type="checkbox"
                checked={selectedOrigins.includes(origin)}
                onChange={() => toggleOrigin(origin)}
                className="h-4 w-4 rounded border-cacao-300 text-cacao-700 focus:ring-cacao-500"
              />
              {origin}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-cacao-800">
          {t('filter_cacao')}: {cacaoRange}%+
        </h2>
        <input
          type="range"
          min={40}
          max={90}
          step={5}
          value={cacaoRange}
          onChange={(e) => setCacaoRange(Number(e.target.value))}
          aria-label={`${t('filter_cacao')}: ${cacaoRange}%+`}
          className="w-full accent-cacao-700"
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-cacao-800">
          {t('filter_price')}: ${maxPrice}
        </h2>
        <input
          type="range"
          min={10}
          max={30}
          step={1}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          aria-label={`${t('filter_price')}: $${maxPrice}`}
          className="w-full accent-cacao-700"
        />
      </div>

      <button
        onClick={clearFilters}
        className="text-left text-sm font-medium text-gold-600 hover:underline"
      >
        {t('filter_clear')}
      </button>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-cacao-900">{t('nav_shop')}</h1>
        <div className="flex items-center gap-3">
          <label htmlFor="catalog-sort" className="sr-only">
            {t('sort_label')}
          </label>
          <select
            id="catalog-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-cacao-200 px-3 py-1.5 text-sm text-cacao-700 outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {locale === 'es' ? opt.labelEs : opt.labelEn}
              </option>
            ))}
          </select>
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-cacao-200 px-3 py-1.5 text-sm text-cacao-700 lg:hidden"
          >
            <SlidersHorizontal size={15} /> Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">{FilterPanel}</aside>

        {filtersOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="filters-drawer-title"
          >
            <div className="absolute inset-0 bg-cacao-900/40" onClick={() => setFiltersOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-cream-50 p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <span id="filters-drawer-title" className="font-serif text-lg font-semibold">Filters</span>
                <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                  <X size={20} />
                </button>
              </div>
              {FilterPanel}
            </div>
          </div>
        )}

        <div>
          {filtered.length === 0 ? (
            <p className="text-cacao-500">No products match these filters.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
