import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useLocale } from '../context/LocaleContext'

function Field({ id, label, ...inputProps }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        placeholder={label}
        className="rounded-lg border border-cacao-200 px-3 py-2 text-sm outline-none focus:border-cacao-500"
        {...inputProps}
      />
    </div>
  )
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { isAuthenticated, openLogin } = useAuth()
  const { locale, t } = useLocale()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    clearCart()
    navigate('/order-confirmation')
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-8">
          <fieldset className="flex flex-col gap-4 rounded-2xl border border-cacao-100 bg-white p-6">
            <legend className="px-1 font-serif text-lg font-semibold text-cacao-900">
              {t('checkout_contact')}
            </legend>
            <Field id="checkout-email" label="Email" required type="email" />
            <Field id="checkout-phone" label="Phone" required type="tel" />
          </fieldset>

          <fieldset className="flex flex-col gap-4 rounded-2xl border border-cacao-100 bg-white p-6">
            <legend className="px-1 font-serif text-lg font-semibold text-cacao-900">
              {t('checkout_shipping')}
            </legend>
            <div className="grid grid-cols-2 gap-4">
              <Field id="checkout-first-name" label="First Name" required />
              <Field id="checkout-last-name" label="Last Name" required />
            </div>
            <Field id="checkout-address" label="Address" required />
            <div className="grid grid-cols-3 gap-4">
              <Field id="checkout-city" label="City" required />
              <Field id="checkout-state" label="State" required />
              <Field id="checkout-zip" label="ZIP" required />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-4 rounded-2xl border border-cacao-100 bg-white p-6">
            <legend className="px-1 font-serif text-lg font-semibold text-cacao-900">
              {t('checkout_payment')}
            </legend>
            <Field id="checkout-card-number" label="Card Number" required />
            <div className="grid grid-cols-2 gap-4">
              <Field id="checkout-card-expiry" label="MM / YY" required />
              <Field id="checkout-card-cvc" label="CVC" required />
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
