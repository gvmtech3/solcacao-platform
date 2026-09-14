import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'

export default function OrderConfirmation() {
  const { t } = useLocale()
  const orderNumber = `SC-${Math.floor(100000 + Math.random() * 900000)}`

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-4 py-24 text-center sm:px-6 lg:px-8">
      <CheckCircle2 size={56} className="text-gold-500" />
      <h1 className="font-serif text-3xl font-bold text-cacao-900">{t('order_confirmed_title')}</h1>
      <p className="text-cacao-600">{t('order_confirmed_body')}</p>
      <span className="rounded-full bg-cacao-100 px-4 py-1.5 text-sm font-semibold text-cacao-700">
        Order #{orderNumber}
      </span>
      <Link
        to="/shop"
        className="mt-4 rounded-full bg-cacao-700 px-6 py-3 text-sm font-semibold text-white hover:bg-cacao-600"
      >
        {t('cart_continue_shopping')}
      </Link>
    </div>
  )
}
