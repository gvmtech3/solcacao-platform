import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleContext'

export default function NotFound() {
  const { t } = useLocale()

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-32 text-center sm:px-6 lg:px-8">
      <span className="font-serif text-7xl font-bold text-cacao-200">404</span>
      <h1 className="font-serif text-2xl font-bold text-cacao-900">{t('not_found_title')}</h1>
      <p className="text-cacao-500">{t('not_found_body')}</p>
      <Link
        to="/"
        className="mt-2 rounded-full bg-cacao-700 px-6 py-3 text-sm font-semibold text-white hover:bg-cacao-600"
      >
        {t('not_found_cta')}
      </Link>
    </div>
  )
}
