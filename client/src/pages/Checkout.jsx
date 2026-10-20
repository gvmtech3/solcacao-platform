import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useLocale } from '../context/LocaleContext'
import {
  validateName,
  validateCity,
  validateState,
  validatePhone,
  validateEmail,
  validateCardNumber,
  validateExpiry,
  validateCVC,
  validateRequired,
  currentMonthValue,
} from '../utils/validators'

const FIELDS = [
  { name: 'email', label: 'Email', type: 'email', validate: validateEmail },
  { name: 'phone', label: 'Phone', type: 'tel', validate: validatePhone },
  { name: 'firstName', label: 'First Name', validate: (v) => validateName(v, 'First name') },
  { name: 'lastName', label: 'Last Name', validate: (v) => validateName(v, 'Last name') },
  { name: 'address', label: 'Address', validate: (v) => validateRequired(v, 'Address') },
  { name: 'city', label: 'City', validate: validateCity },
  { name: 'state', label: 'State', validate: validateState },
  { name: 'zip', label: 'ZIP', validate: (v) => validateRequired(v, 'ZIP code') },
  {
    name: 'cardNumber',
    label: 'Card Number',
    inputMode: 'numeric',
    autoComplete: 'cc-number',
    validate: validateCardNumber,
  },
  {
    name: 'expiry',
    label: 'Expiration Date',
    type: 'month',
    min: currentMonthValue(),
    validate: validateExpiry,
  },
  { name: 'cvc', label: 'CVC', inputMode: 'numeric', maxLength: 4, validate: validateCVC },
]

const INITIAL_VALUES = Object.fromEntries(FIELDS.map((f) => [f.name, '']))

function Field({ id, label, error, type = 'text', ...inputProps }) {
  const errorId = `${id}-error`
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={type === 'month' ? undefined : label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`rounded-lg border px-3 py-2 text-sm outline-none focus:border-cacao-500 ${
          error ? 'border-red-400' : 'border-cacao-200'
        }`}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { isAuthenticated, openLogin } = useAuth()
  const { locale, t } = useLocale()
  const navigate = useNavigate()

  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const fieldByName = Object.fromEntries(FIELDS.map((f) => [f.name, f]))

  const runValidation = (name, value) => fieldByName[name].validate(value)

  const handleChange = (name) => (e) => {
    const value = e.target.value
    setValues((prev) => ({ ...prev, [name]: value }))
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: runValidation(name, value) }))
    }
  }

  const handleBlur = (name) => () => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: runValidation(name, values[name]) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const nextErrors = {}
    FIELDS.forEach((f) => {
      const err = runValidation(f.name, values[f.name])
      if (err) nextErrors[f.name] = err
    })
    setErrors(nextErrors)
    setTouched(Object.fromEntries(FIELDS.map((f) => [f.name, true])))

    if (Object.keys(nextErrors).length > 0) return

    clearCart()
    navigate('/order-confirmation')
  }

  const fieldProps = (name) => {
    const field = fieldByName[name]
    return {
      id: `checkout-${name}`,
      label: field.label,
      type: field.type,
      inputMode: field.inputMode,
      maxLength: field.maxLength,
      min: field.min,
      autoComplete: field.autoComplete,
      value: values[name],
      onChange: handleChange(name),
      onBlur: handleBlur(name),
      error: touched[name] ? errors[name] : undefined,
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-serif text-3xl font-bold text-cacao-900">{t('checkout_title')}</h1>

      {!isAuthenticated && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold-300 bg-gold-300/10 px-5 py-3 text-sm">
          <span className="text-cacao-700">Have an account? Sign in for faster checkout.</span>
          <button
            type="button"
            onClick={openLogin}
            className="font-semibold text-cacao-800 hover:underline"
          >
            {t('nav_login')}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-8">
          <fieldset className="flex flex-col gap-4 rounded-2xl border border-cacao-100 bg-white p-6">
            <legend className="px-1 font-serif text-lg font-semibold text-cacao-900">
              {t('checkout_contact')}
            </legend>
            <Field {...fieldProps('email')} />
            <Field {...fieldProps('phone')} />
          </fieldset>

          <fieldset className="flex flex-col gap-4 rounded-2xl border border-cacao-100 bg-white p-6">
            <legend className="px-1 font-serif text-lg font-semibold text-cacao-900">
              {t('checkout_shipping')}
            </legend>
            <div className="grid grid-cols-2 gap-4">
              <Field {...fieldProps('firstName')} />
              <Field {...fieldProps('lastName')} />
            </div>
            <Field {...fieldProps('address')} />
            <div className="grid grid-cols-3 gap-4">
              <Field {...fieldProps('city')} />
              <Field {...fieldProps('state')} />
              <Field {...fieldProps('zip')} />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-4 rounded-2xl border border-cacao-100 bg-white p-6">
            <legend className="px-1 font-serif text-lg font-semibold text-cacao-900">
              {t('checkout_payment')}
            </legend>
            <Field {...fieldProps('cardNumber')} />
            <div className="grid grid-cols-2 gap-4">
              <Field {...fieldProps('expiry')} />
              <Field {...fieldProps('cvc')} />
            </div>
          </fieldset>
        </div>

        <div className="h-fit rounded-2xl border border-cacao-100 bg-white p-6">
          <h2 className="mb-4 font-serif text-lg font-semibold text-cacao-900">Order Summary</h2>
          <ul className="mb-4 flex flex-col gap-3">
            {items.map(({ product, quantity }) => {
              const name = locale === 'es' ? product.nameEs : product.nameEn
              return (
                <li key={product.id} className="flex justify-between text-sm">
                  <span className="text-cacao-600">
                    {name} × {quantity}
                  </span>
                  <span className="font-medium">${(product.price * quantity).toFixed(2)}</span>
                </li>
              )
            })}
          </ul>
          <div className="flex justify-between border-t border-cacao-100 pt-3 text-sm font-semibold">
            <span>{t('cart_subtotal')}</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <button
            type="submit"
            disabled={items.length === 0}
            className="mt-5 w-full rounded-full bg-cacao-700 py-3 text-sm font-semibold text-white hover:bg-cacao-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('checkout_place_order')}
          </button>
        </div>
      </form>
    </div>
  )
}
