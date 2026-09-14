import { useState } from 'react'
import { MessageCircle, CheckCircle2 } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'

const CATEGORIES = [
  { value: 'general', labelEn: 'General Inquiry', labelEs: 'Consulta General' },
  { value: 'wholesale', labelEn: 'Wholesale / B2B', labelEs: 'Mayoreo / B2B' },
  { value: 'support', labelEn: 'Order Support', labelEs: 'Soporte de Pedido' },
]

export default function Contact() {
  const { t, locale } = useLocale()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-serif text-3xl font-bold text-cacao-900">{t('contact_title')}</h1>
      <p className="mb-8 text-cacao-500">
        Questions about an order, wholesale partnerships, or anything else? We'd love to hear from you.
      </p>

      {submitted ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-cacao-100 bg-white p-10 text-center">
          <CheckCircle2 size={44} className="text-gold-500" />
          <p className="text-cacao-700">Thanks for reaching out — our team will respond within 1-2 business days.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-cacao-100 bg-white p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-cacao-500">{t('contact_name')}</label>
              <input required className="mt-1 w-full rounded-lg border border-cacao-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-cacao-500">{t('contact_email')}</label>
              <input required type="email" className="mt-1 w-full rounded-lg border border-cacao-200 px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-cacao-500">{t('contact_category')}</label>
            <select className="mt-1 w-full rounded-lg border border-cacao-200 px-3 py-2 text-sm" defaultValue="general">
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {locale === 'es' ? c.labelEs : c.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-cacao-500">{t('contact_message')}</label>
            <textarea required rows={5} className="mt-1 w-full rounded-lg border border-cacao-200 px-3 py-2 text-sm" />
          </div>

          <button
            type="submit"
            className="mt-2 flex w-fit items-center gap-2 rounded-full bg-cacao-700 px-6 py-3 text-sm font-semibold text-white hover:bg-cacao-600"
          >
            <MessageCircle size={16} />
            {t('contact_submit')}
          </button>
        </form>
      )}
    </div>
  )
}
