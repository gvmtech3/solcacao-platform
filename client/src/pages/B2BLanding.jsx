import { Link } from 'react-router-dom'
import { Building2, Gift, PackageCheck, Palette } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'

const SERVICES = [
  {
    icon: Palette,
    titleEn: 'Custom Corporate Molds',
    titleEs: 'Moldes Corporativos Personalizados',
    bodyEn: 'Chocolate shaped to your logo or brand mark, cast in single-origin cacao.',
    bodyEs: 'Chocolate moldeado con tu logo, elaborado con cacao de origen único.',
  },
  {
    icon: Gift,
    titleEn: 'Luxury Packaging Design',
    titleEs: 'Diseño de Empaque de Lujo',
    bodyEn: 'Bespoke boxes and wrapping that match your event or hotel amenity program.',
    bodyEs: 'Cajas y envoltorios a medida para tu evento o programa de hotel.',
  },
  {
    icon: Building2,
    titleEn: 'White-Label Branding',
    titleEs: 'Marca Blanca',
    bodyEn: 'Full white-label production for resale under your own brand.',
    bodyEs: 'Producción de marca blanca completa para reventa bajo tu propia marca.',
  },
  {
    icon: PackageCheck,
    titleEn: 'Bulk Corporate Gifting',
    titleEs: 'Regalos Corporativos al Mayoreo',
    bodyEn: 'Reliable, high-volume fulfillment for corporate gifting programs.',
    bodyEs: 'Cumplimiento confiable de alto volumen para programas de regalos corporativos.',
  },
]

export default function B2BLanding() {
  const { t, locale } = useLocale()

  return (
    <div className="flex flex-col gap-20 pb-20">
      <section className="bg-gradient-to-br from-cacao-900 via-cacao-800 to-cacao-700 text-cream-50">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-300">
            SolCacao for Business
          </span>
          <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">{t('b2b_hero_title')}</h1>
          <p className="mx-auto mt-5 max-w-xl text-cacao-100">{t('b2b_hero_subtitle')}</p>
          <Link
            to="/b2b/custom-order"
            className="mt-8 inline-block rounded-full bg-gold-500 px-8 py-3 text-sm font-semibold text-cacao-900 hover:bg-gold-400"
          >
            {t('b2b_cta')}
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(({ icon: Icon, titleEn, titleEs, bodyEn, bodyEs }) => (
            <div key={titleEn} className="flex flex-col gap-3 rounded-2xl border border-cacao-100 bg-white p-6">
              <Icon className="text-gold-600" size={28} />
              <h3 className="font-serif text-lg font-semibold text-cacao-900">
                {locale === 'es' ? titleEs : titleEn}
              </h3>
              <p className="text-sm text-cacao-600">{locale === 'es' ? bodyEs : bodyEn}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-serif text-2xl font-bold text-cacao-900">Trusted by hotels & event teams</h2>
        <p className="mt-3 text-cacao-600">
          From boutique hotel welcome amenities to large corporate gifting campaigns, SolCacao's B2B
          team partners with you from concept to delivery.
        </p>
        <Link
          to="/b2b/custom-order"
          className="mt-6 inline-block rounded-full bg-cacao-700 px-6 py-3 text-sm font-semibold text-white hover:bg-cacao-600"
        >
          {t('b2b_cta')}
        </Link>
      </section>
    </div>
  )
}
