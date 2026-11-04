import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLocale } from '../../context/LocaleContext'
import useEscapeKey from '../../hooks/useEscapeKey'

export default function AuthModal() {
  const { isModalOpen, modalView, setModalView, closeModal, login, register, authError, clearAuthError } =
    useAuth()
  const { t } = useLocale()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [accountType, setAccountType] = useState('retail')
  const [submitting, setSubmitting] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  useEscapeKey(isModalOpen, closeModal)

  if (!isModalOpen) return null

  const isLogin = modalView === 'login'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    if (isLogin) {
      await login({ email, password })
    } else {
      const registered = await register({ email, password, firstName, accountType })
      if (registered) {
        setPassword('')
        setRegistrationSuccess(true)
        setModalView('login')
      }
    }
    setSubmitting(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="absolute inset-0 bg-cacao-900/50" onClick={closeModal} />
      <div className="relative w-full max-w-sm rounded-2xl bg-cream-50 p-6 shadow-xl">
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-4 top-4 p-1 text-cacao-500 hover:text-cacao-800"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 id="auth-modal-title" className="mb-5 font-serif text-2xl font-semibold text-cacao-900">
          {isLogin ? t('login_title') : t('register_title')}
        </h2>

        {isLogin && registrationSuccess && (
          <p role="status" className="mb-4 text-sm text-green-700">
            {t('register_success')}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label htmlFor="auth-first-name" className="text-xs font-medium text-cacao-600">
                First Name
              </label>
              <input
                id="auth-first-name"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-lg border border-cacao-200 px-3 py-2 text-sm outline-none focus:border-cacao-500"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="auth-email" className="text-xs font-medium text-cacao-600">
              {t('login_email')}
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-cacao-200 px-3 py-2 text-sm outline-none focus:border-cacao-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="auth-password" className="text-xs font-medium text-cacao-600">
              {t('login_password')}
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={isLogin ? undefined : 8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-cacao-200 px-3 py-2 text-sm outline-none focus:border-cacao-500"
            />
            {!isLogin && <p className="text-xs text-cacao-400">At least 8 characters.</p>}
          </div>

          {!isLogin && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-cacao-600">Account Type</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'retail', label: t('account_type_retail') },
                  { value: 'b2b', label: t('account_type_b2b') },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={accountType === opt.value}
                    onClick={() => setAccountType(opt.value)}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                      accountType === opt.value
                        ? 'border-cacao-700 bg-cacao-700 text-white'
                        : 'border-cacao-200 text-cacao-600 hover:border-cacao-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {authError && (
            <p role="alert" className="text-sm text-red-600">
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-full bg-cacao-700 py-2.5 text-sm font-semibold text-white hover:bg-cacao-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLogin ? t('login_submit') : t('register_title')}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-cacao-500">
          {isLogin ? t('login_switch') : t('register_switch')}{' '}
          <button
            type="button"
            onClick={() => {
              clearAuthError()
              setRegistrationSuccess(false)
              setModalView(isLogin ? 'register' : 'login')
            }}
            className="font-semibold text-cacao-800 hover:underline"
          >
            {isLogin ? t('register_title') : t('login_submit')}
          </button>
        </p>
      </div>
    </div>
  )
}
