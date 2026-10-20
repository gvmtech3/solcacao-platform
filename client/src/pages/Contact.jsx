import { useState } from 'react'
import { MessageCircle, CheckCircle2 } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'
import { validateName, validateEmail, validateMessage } from '../utils/validators'

const CATEGORIES = [
  { value: 'general', labelEn: 'General Inquiry', labelEs: 'Consulta General' },
  { value: 'wholesale', labelEn: 'Wholesale / B2B', labelEs: 'Mayoreo / B2B' },
  { value: 'support', labelEn: 'Order Support', labelEs: 'Soporte de Pedido' },
]

const INITIAL_VALUES = { name: '', email: '', category: 'general', message: '' }

export default function Contact() {
  const { t, locale } = useLocale()
  const [submitted, setSubmitted] = useState(false)
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validators = {
    name: (v) => validateName(v, 'Name'),
    email: validateEmail,
    message: (v) => validateMessage(v, 10),
  }

  const handleChange = (name) => (e) => {
    const value = e.target.value
    setValues((prev) => ({ ...prev, [name]: value }))
    if (touched[name] && validators[name]) {
      setErrors((prev) => ({ ...prev, [name]: validators[name](value) }))
    }
  }

  const handleBlur = (name) => () => {
    if (!validators[name]) return
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validators[name](values[name]) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const nextErrors = {}
    Object.entries(validators).forEach(([name, validate]) => {
      const err = validate(values[name])
      if (err) nextErrors[name] = err
    })
    setErrors(nextErrors)
    setTouched({ name: true, email: true, message: true })

    if (Object.keys(nextErrors).length > 0) return

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
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 rounded-2xl border border-cacao-100 bg-white p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="text-xs font-medium text-cacao-500">{t('contact_name')}</label>
              <input
                id="contact-name"
                value={values.name}
                onChange={handleChange('name')}
                onBlur={handleBlur('name')}
                aria-invalid={Boolean(touched.name && errors.name)}
                aria-describedby={touched.name && errors.name ? 'contact-name-error' : undefined}
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                  touched.name && errors.name ? 'border-red-400' : 'border-cacao-200'
                }`}
              />
              {touched.name && errors.name && (
                <p id="contact-name-error" className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="contact-email" className="text-xs font-medium text-cacao-500">{t('contact_email')}</label>
              <input
                id="contact-email"
                type="email"
                value={values.email}
                onChange={handleChange('email')}
                onBlur={handleBlur('email')}
                aria-invalid={Boolean(touched.email && errors.email)}
                aria-describedby={touched.email && errors.email ? 'contact-email-error' : undefined}
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                  touched.email && errors.email ? 'border-red-400' : 'border-cacao-200'
                }`}
              />
              {touched.email && errors.email && (
                <p id="contact-email-error" className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="contact-category" className="text-xs font-medium text-cacao-500">{t('contact_category')}</label>
            <select
              id="contact-category"
              value={values.category}
              onChange={handleChange('category')}
              className="mt-1 w-full rounded-lg border border-cacao-200 px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {locale === 'es' ? c.labelEs : c.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="contact-message" className="text-xs font-medium text-cacao-500">{t('contact_message')}</label>
            <textarea
              id="contact-message"
              rows={5}
              value={values.message}
              onChange={handleChange('message')}
              onBlur={handleBlur('message')}
              aria-invalid={Boolean(touched.message && errors.message)}
              aria-describedby={touched.message && errors.message ? 'contact-message-error' : undefined}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                touched.message && errors.message ? 'border-red-400' : 'border-cacao-200'
              }`}
            />
            {touched.message && errors.message && (
              <p id="contact-message-error" className="mt-1 text-xs text-red-600">{errors.message}</p>
            )}
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
