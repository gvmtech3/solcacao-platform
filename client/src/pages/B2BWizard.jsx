import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, UploadCloud } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'

const STEP_KEYS = ['wizard_step1', 'wizard_step2', 'wizard_step3', 'wizard_step4']

const CACAO_PROFILES = ['55% Milk-Dark Blend', '64% Semisweet', '72% Dark', '85% Extra Dark']
const PACKAGING_OPTIONS = ['Kraft Gift Box', 'Matte Black Rigid Box', 'Clear Window Sleeve', 'Custom Die-Cut']

export default function B2BWizard() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const [form, setForm] = useState({
    cacaoProfile: CACAO_PROFILES[0],
    quantity: 250,
    fileName: '',
    packaging: PACKAGING_OPTIONS[0],
    notes: '',
    companyName: '',
    email: '',
  })

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const next = () => setStep((s) => Math.min(s + 1, STEP_KEYS.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/b2b/confirmation')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-serif text-3xl font-bold text-cacao-900">{t('b2b_cta')}</h1>
      <p className="mb-8 text-cacao-500">Tell us about your project in four quick steps.</p>

      {/* Stepper */}
      <ol className="mb-10 flex items-center gap-2">
        {STEP_KEYS.map((key, i) => (
          <li key={key} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                i < step
                  ? 'bg-cacao-700 text-white'
                  : i === step
                  ? 'border-2 border-cacao-700 text-cacao-700'
                  : 'border border-cacao-200 text-cacao-300'
              }`}
            >
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span
              className={`hidden text-xs font-medium sm:block ${
                i <= step ? 'text-cacao-800' : 'text-cacao-300'
              }`}
            >
              {t(key)}
            </span>
            {i < STEP_KEYS.length - 1 && <div className="h-px flex-1 bg-cacao-200" />}
          </li>
        ))}
      </ol>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-cacao-100 bg-white p-6 sm:p-8">
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif text-xl font-semibold text-cacao-900">{t('wizard_step1')}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {CACAO_PROFILES.map((profile) => (
                <button
                  type="button"
                  key={profile}
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
              <label className="text-xs font-medium text-cacao-500">Estimated Quantity (units)</label>
              <input
                type="number"
                min={50}
                value={form.quantity}
                onChange={(e) => update('quantity', e.target.value)}
                className="mt-1 w-full rounded-lg border border-cacao-200 px-3 py-2 text-sm"
              />
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
              <span className="text-xs text-cacao-400">Click to browse</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => update('fileName', e.target.files?.[0]?.name || '')}
              />
            </label>
            <div>
              <label className="text-xs font-medium text-cacao-500">Company Name</label>
              <input
                required
                value={form.companyName}
                onChange={(e) => update('companyName', e.target.value)}
                className="mt-1 w-full rounded-lg border border-cacao-200 px-3 py-2 text-sm"
              />
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
              <label className="text-xs font-medium text-cacao-500">Additional Notes</label>
              <textarea
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
                <dt className="text-cacao-400">Cacao Profile</dt>
                <dd className="font-medium text-cacao-800">{form.cacaoProfile}</dd>
              </div>
              <div>
                <dt className="text-cacao-400">Quantity</dt>
                <dd className="font-medium text-cacao-800">{form.quantity} units</dd>
              </div>
              <div>
                <dt className="text-cacao-400">Brand Asset</dt>
                <dd className="font-medium text-cacao-800">{form.fileName || 'Not uploaded'}</dd>
              </div>
              <div>
                <dt className="text-cacao-400">Packaging</dt>
                <dd className="font-medium text-cacao-800">{form.packaging}</dd>
              </div>
              <div>
                <dt className="text-cacao-400">Company</dt>
                <dd className="font-medium text-cacao-800">{form.companyName || '—'}</dd>
              </div>
            </dl>
            <div>
              <label className="text-xs font-medium text-cacao-500">Contact Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="mt-1 w-full rounded-lg border border-cacao-200 px-3 py-2 text-sm"
              />
            </div>
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
              type="submit"
              className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-cacao-900 hover:bg-gold-400"
            >
              {t('wizard_submit')}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
