import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'
import { useProducts } from '../context/ProductsContext'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/common/ProductCard'
import ProductImage from '../components/common/ProductImage'
import SectionHeading from '../components/common/SectionHeading'

export default function Home() {
  const { t, locale } = useLocale()
  const { products, categories, loading } = useProducts()
  const { isAuthenticated } = useAuth()
  // ChannelRoute already keeps b2b-authenticated users off this page, so
  // "authenticated" here always means a retail account that doesn't need
  // the cross-channel B2B upsell.
  const showB2BCrossSell = !isAuthenticated
  const seasonal = products.filter((p) => p.productType === 'seasonal')

  if (loading) {
    return <div className="py-32 text-center text-cacao-500">Loading…</div>
  }

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-cacao-800 via-cacao-700 to-cacao-900 text-cream-50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="flex flex-col items-start gap-6">
            <span className="rounded-full border border-gold-400/50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold-300">
              Organic · Single-Origin
            </span>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">{t('hero_title')}</h1>
            <p className="max-w-md text-cacao-100">{t('hero_subtitle')}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="flex items-center gap-2 rounded-full bg-gold-600 px-6 py-3 text-sm font-semibold text-white hover:bg-gold-500"
              >
                {t('hero_cta')} <ArrowRight size={16} />
              </Link>
              {showB2BCrossSell && (
                <Link
                  to="/b2b"
                  className="rounded-full border border-cream-50/40 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-white/10"
                >
                  {t('hero_cta_b2b')}
                </Link>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {products.slice(0, 4).map((p) => (
              <ProductImage key={p.id} product={p} className="aspect-square rounded-2xl shadow-lg" />
            ))}
          </div>
        </div>
      </section>

      {/* Featured categories */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('featured_categories')} />
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group relative flex h-48 items-end overflow-hidden rounded-2xl bg-cacao-200 p-5"
            >
              {cat.imageUrl && (
                <img
                  src={cat.imageUrl}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-cacao-900/80 via-cacao-900/20 to-transparent" />
              <span className="relative font-serif text-xl font-semibold text-white">
                {locale === 'es' ? cat.nameEs : cat.nameEn}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Seasonal */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('seasonal_title')} />
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {seasonal.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* B2B teaser */}
      {showB2BCrossSell && (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-6 rounded-3xl bg-cacao-100 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3">
              <h2 className="font-serif text-2xl font-bold text-cacao-900 sm:text-3xl">
                {t('b2b_hero_title')}
              </h2>
              <p className="max-w-lg text-cacao-600">{t('b2b_hero_subtitle')}</p>
            </div>
            <Link
              to="/b2b"
              className="shrink-0 rounded-full bg-cacao-800 px-6 py-3 text-sm font-semibold text-white hover:bg-cacao-700"
            >
              {t('b2b_cta')}
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
