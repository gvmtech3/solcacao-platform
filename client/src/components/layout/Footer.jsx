import { Link } from 'react-router-dom'
import { useLocale } from '../../context/LocaleContext'

export default function Footer() {
  const { t } = useLocale()

  return (
    <footer className="border-t border-cacao-100 bg-cacao-900 text-cacao-100">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
          <span className="font-serif text-xl font-bold text-white">SolCacao</span>
          <p className="text-sm text-cacao-300">{t('footer_tagline')}</p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-wide text-cacao-400">
            {t('footer_shop')}
          </span>
          <Link to="/shop" className="text-sm text-cacao-200 hover:text-white">
            {t('nav_shop')}
          </Link>
          <Link to="/b2b" className="text-sm text-cacao-200 hover:text-white">
            {t('nav_b2b')}
          </Link>
          <Link to="/sampler" className="text-sm text-cacao-200 hover:text-white">
            {t('nav_sampler')}
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-wide text-cacao-400">
            {t('footer_company')}
          </span>
          <Link to="/about" className="text-sm text-cacao-200 hover:text-white">
            {t('nav_about')}
          </Link>
          <Link to="/contact" className="text-sm text-cacao-200 hover:text-white">
            {t('nav_contact')}
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-wide text-cacao-400">
            {t('footer_support')}
          </span>
          <Link to="/contact" className="text-sm text-cacao-200 hover:text-white">
            {t('nav_contact')}
          </Link>
        </div>
      </div>
      <div className="border-t border-cacao-800 px-4 py-4 text-center text-xs text-cacao-400 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} SolCacao. {t('footer_rights')}
      </div>
    </footer>
  )
}
