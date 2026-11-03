import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, UploadCloud } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'
import { validateName, validateEmail, validatePhone, validateRequired, validateQuantity } from '../utils/validators'
import { api, ApiError } from '../utils/apiClient'

const STEP_KEYS = ['wizard_step1', 'wizard_step2', 'wizard_step3', 'wizard_step4']

const CACAO_PROFILES = ['55% Milk-Dark Blend', '64% Semisweet', '72% Dark', '85% Extra Dark']
const PACKAGING_OPTIONS = ['Kraft Gift Box', 'Matte Black Rigid Box', 'Clear Window Sleeve', 'Custom Die-Cut']

const VALIDATORS = {
  quantity: (v) => validateQuantity(v, 50),
  companyName: (v) => validateRequired(v, 'Company name'),
  contactName: (v) => validateName(v, 'Contact name'),
  email: validateEmail,
  phone: validatePhone,
}

const STEP_FIELDS = [['quantity'], ['companyName', 'contactName'], [], ['email', 'phone']]

function FieldError({ id, error }) {
  if (!error) return null
  return (
    <p id={id} className="mt-1 text-xs text-red-600">
      {error}
    </p>
  )
}

export default function B2BWizard() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const [form, setForm] = useState({
    cacaoProfile: CACAO_PROFILES[0],
    quantity: 250,
    fileName: '',
    file: null,
    packaging: PACKAGING_OPTIONS[0],
    notes: '',
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [contactSubmitAttempted, setContactSubmitAttempted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: VALIDATORS[field](value) }))
    }
  }

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => ({ ...prev, [field]: VALIDATORS[field](form[field]) }))
  }

  const validateStep = (stepIndex) => {
    const fields = STEP_FIELDS[stepIndex]
    const stepErrors = {}
    fields.forEach((field) => {
      const err = VALIDATORS[field](form[field])
      if (err) stepErrors[field] = err
    })
    setErrors((prev) => {
      const nextErrors = { ...prev }
      fields.forEach((field) => {
        if (stepErrors[field]) nextErrors[field] = stepErrors[field]
        else delete nextErrors[field]
      })
      return nextErrors
    })
    setTouched((prev) => ({ ...prev, ...Object.fromEntries(fields.map((f) => [f, true])) }))
    return Object.keys(stepErrors).length === 0
  }

  const next = () => {
    if (!validateStep(step)) return
    setContactSubmitAttempted(false)
    setStep((s) => Math.min(s + 1, STEP_KEYS.length - 1))
  }
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (step >= STEP_KEYS.length - 1) return
    next()
  }

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter' || !(e.target instanceof HTMLInputElement) || e.target.type === 'file') return
    e.preventDefault()
    if (step < STEP_KEYS.length - 1) next()
  }

  const handleFinalSubmit = async () => {
    setContactSubmitAttempted(true)
    setSubmitError(null)
    if (!validateStep(step)) return

    const formData = new FormData()
    formData.append('companyName', form.companyName)
    formData.append('contactName', form.contactName)
    formData.append('email', form.email)
    formData.append('phone', form.phone)
    formData.append('cacaoProfile', form.cacaoProfile)
    formData.append('estimatedQuantity', String(form.quantity))
    formData.append('packagingPreference', form.packaging)
    if (form.notes) formData.append('notes', form.notes)
    if (form.file) formData.append('brandAsset', form.file)

    setSubmitting(true)
    try {
      const { quote } = await api.post('/b2b/quotes', formData, { isFormData: true })
      navigate('/b2b/confirmation', { state: { quoteNumber: quote.quoteNumber } })
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Unable to submit your request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const shouldShowError = (field) =>
    field === 'email' || field === 'phone'
      ? contactSubmitAttempted
      : touched[field]

  const errorProps = (field) => {
    const showError = shouldShowError(field) && errors[field]
    return {
      'aria-invalid': Boolean(showError),
      'aria-describedby': showError ? `${field}-error` : undefined,
    }
  }

  const fieldClass = (field) =>
    `mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
      shouldShowError(field) && errors[field] ? 'border-red-400' : 'border-cacao-200'
    }`

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-serif text-3xl font-bold text-cacao-900">{t('b2b_cta')}</h1>
      <p className="mb-8 text-cacao-500">Tell us about your project in four quick steps.</p>

      {/* Stepper */}
      <ol className="mb-10 flex items-center gap-2">
        {STEP_KEYS.map((key, i) => (
          <li
            key={key}
            className="flex flex-1 items-center gap-2"
            aria-current={i === step ? 'step' : undefined}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                i < step
                  ? 'bg-cacao-700 text-white'
                  : i === step
                  ? 'border-2 border-cacao-700 text-cacao-700'
                  : 'border border-cacao-200 text-cacao-500'
              }`}
            >
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span
              className={`hidden text-xs font-medium sm:block ${
                i <= step ? 'text-cacao-800' : 'text-cacao-500'
              }`}
            >
              {t(key)}
            </span>
            {i < STEP_KEYS.length - 1 && <div className="h-px flex-1 bg-cacao-200" />}
          </li>
        ))}
      </ol>

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} noValidate className="rounded-2xl border border-cacao-100 bg-white p-6 sm:p-8">
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif text-xl font-semibold text-cacao-900">{t('wizard_step1')}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {CACAO_PROFILES.map((profile) => (
                <button
                  type="button"
                  key={profile}
                  aria-pressed={form.cacaoProfile === profile}
                  onClick={() => update('cacaoProfile', profile)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                    form.cacaoProfile === profile
                      ? 'border-cacao-700 bg-cacao-700 text-white'
                      : 'border-cacao-200 text-cacao-700 hover:border-cacao-400'
                  }`}
                >
                  {profile}
                </button>
              ))}
            </div>
            <div>
              <label htmlFor="wizard-quantity" className="text-xs font-medium text-cacao-500">Estimated Quantity (units)</label>
              <input
                id="wizard-quantity"
                type="number"
                min={50}
                step={1}
                value={form.quantity}
                onChange={(e) => update('quantity', e.target.value)}
                onBlur={handleBlur('quantity')}
                className={fieldClass('quantity')}
                {...errorProps('quantity')}
              />
              <FieldError id="quantity-error" error={touched.quantity && errors.quantity} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif text-xl font-semibold text-cacao-900">{t('wizard_step2')}</h2>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-cacao-300 px-6 py-10 text-center hover:border-cacao-500">
              <UploadCloud className="text-cacao-500" size={30} />
              <span className="text-sm font-medium text-cacao-700">
                {form.fileName || 'Upload brand vector or tech pack (.ai, .svg, .pdf)'}
              </span>
              <span className="text-xs text-cacao-600">Click to browse</span>
              <input
                type="file"
                accept=".pdf,.svg,.ai"
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files?.[0] || null
                  setForm((prev) => ({ ...prev, file: selected, fileName: selected?.name || '' }))
                }}
              />
            </label>
            <div>
              <label htmlFor="wizard-company-name" className="text-xs font-medium text-cacao-500">Company Name</label>
              <input
                id="wizard-company-name"
                value={form.companyName}
                onChange={(e) => update('companyName', e.target.value)}
                onBlur={handleBlur('companyName')}
                className={fieldClass('companyName')}
                {...errorProps('companyName')}
              />
              <FieldError id="companyName-error" error={touched.companyName && errors.companyName} />
            </div>
            <div>
              <label htmlFor="wizard-contact-name" className="text-xs font-medium text-cacao-500">Contact Name</label>
              <input
                id="wizard-contact-name"
                value={form.contactName}
                onChange={(e) => update('contactName', e.target.value)}
                onBlur={handleBlur('contactName')}
                className={fieldClass('contactName')}
                {...errorProps('contactName')}
              />
              <FieldError id="contactName-error" error={touched.contactName && errors.contactName} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif text-xl font-semibold text-cacao-900">{t('wizard_step3')}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PACKAGING_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option}
                  aria-pressed={form.packaging === option}
                  onClick={() => update('packaging', option)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                    form.packaging === option
                      ? 'border-cacao-700 bg-cacao-700 text-white'
                      : 'border-cacao-200 text-cacao-700 hover:border-cacao-400'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div>
              <label htmlFor="wizard-notes" className="text-xs font-medium text-cacao-500">Additional Notes</label>
              <textarea
                id="wizard-notes"
                rows={3}
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                className="mt-1 w-full rounded-lg border border-cacao-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif text-xl font-semibold text-cacao-900">{t('wizard_step4')}</h2>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-cacao-600">Cacao Profile</dt>
                <dd className="font-medium text-cacao-800">{form.cacaoProfile}</dd>
              </div>
              <div>
                <dt className="text-cacao-600">Quantity</dt>
                <dd className="font-medium text-cacao-800">{form.quantity} units</dd>
              </div>
              <div>
                <dt className="text-cacao-600">Brand Asset</dt>
                <dd className="font-medium text-cacao-800">{form.fileName || 'Not uploaded'}</dd>
              </div>
              <div>
                <dt className="text-cacao-600">Packaging</dt>
                <dd className="font-medium text-cacao-800">{form.packaging}</dd>
              </div>
              <div>
                <dt className="text-cacao-600">Company</dt>
                <dd className="font-medium text-cacao-800">{form.companyName || '—'}</dd>
              </div>
              <div>
                <dt className="text-cacao-600">Contact</dt>
                <dd className="font-medium text-cacao-800">{form.contactName || '—'}</dd>
              </div>
            </dl>
            <div>
              <label htmlFor="wizard-email" className="text-xs font-medium text-cacao-500">Contact Email</label>
              <input
                id="wizard-email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className={fieldClass('email')}
                {...errorProps('email')}
              />
              <FieldError id="email-error" error={shouldShowError('email') && errors.email} />
            </div>
            <div>
              <label htmlFor="wizard-phone" className="text-xs font-medium text-cacao-500">Contact Phone</label>
              <input
                id="wizard-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className={fieldClass('phone')}
                {...errorProps('phone')}
              />
              <FieldError id="phone-error" error={shouldShowError('phone') && errors.phone} />
            </div>
            {submitError && (
              <p role="alert" className="text-sm text-red-600">
                {submitError}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-cacao-100 pt-6">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="rounded-full px-5 py-2 text-sm font-medium text-cacao-600 disabled:opacity-30"
          >
            {t('wizard_back')}
          </button>
          {step < STEP_KEYS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="rounded-full bg-cacao-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cacao-600"
            >
              {t('wizard_next')}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={submitting}
              className="rounded-full bg-gold-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gold-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : t('wizard_submit')}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
