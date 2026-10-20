import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { User, MapPin, Package, LogOut, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLocale } from '../context/LocaleContext'
import { validateCity, validateName, validateRequired, validateState } from '../utils/validators'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'orders', label: 'Order History', icon: Package },
]

const SAMPLE_ORDERS = [
  {
    number: 'SC-2026-1048',
    date: '2026-10-12',
    status: 'delivered',
    total: 49.0,
    items: [
      { nameEn: 'Madagascar Single-Origin 72%', nameEs: 'Origen Único Madagascar 72%', quantity: 2 },
      { nameEn: 'Sea Salt Caramel Truffle Box', nameEs: 'Trufas de Caramelo y Sal Marina', quantity: 1 },
    ],
  },
  {
    number: 'SC-2026-1057',
    date: '2026-10-18',
    status: 'processing',
    total: 37.75,
    items: [
      { nameEn: 'Ecuador Arriba Nacional 85%', nameEs: 'Arriba Nacional Ecuador 85%', quantity: 1 },
      { nameEn: 'Espresso Cacao Truffle Box', nameEs: 'Trufas de Café y Cacao', quantity: 1 },
    ],
  },
]

const EMPTY_ADDRESS = {
  name: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
}

const ADDRESS_FIELDS = [
  { name: 'name', translation: 'account_address_name' },
  { name: 'street', translation: 'account_address_street' },
  { name: 'city', translation: 'account_address_city' },
  { name: 'state', translation: 'account_address_state' },
  { name: 'postalCode', translation: 'account_address_postal_code' },
  { name: 'country', translation: 'account_address_country' },
]

function loadAddresses(storageKey) {
  try {
    const stored = window.localStorage.getItem(storageKey)
    if (!stored) return { addresses: [], storageError: false }

    const addresses = JSON.parse(stored)
    if (!Array.isArray(addresses)) throw new Error('Saved address data is not an array.')
    return { addresses, storageError: false }
  } catch (error) {
    console.error('Unable to load saved addresses from local storage.', error)
    return { addresses: [], storageError: true }
  }
}

export default function Account() {
  const { user, isAuthenticated, logout } = useAuth()
  const { locale, t } = useLocale()
  const [tab, setTab] = useState('profile')
  const storageKey = `solcacao-addresses:${user?.email?.toLowerCase() ?? 'unknown'}`
  const [savedAddresses, setSavedAddresses] = useState(() => loadAddresses(storageKey))
  const [addressFormOpen, setAddressFormOpen] = useState(false)
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS)
  const [addressErrors, setAddressErrors] = useState({})
  const [addressTouched, setAddressTouched] = useState({})

  if (!isAuthenticated) return <Navigate to="/" replace />

  const validateAddress = (address) => {
    const errors = {}
    if (!address.name.trim()) errors.name = t('account_address_error_required')
    else if (validateName(address.name, 'Name')) errors.name = t('account_address_error_name')
    if (validateRequired(address.street)) errors.street = t('account_address_error_required')
    if (!address.city.trim()) errors.city = t('account_address_error_required')
    else if (validateCity(address.city)) errors.city = t('account_address_error_location')
    if (!address.state.trim()) errors.state = t('account_address_error_required')
    else if (validateState(address.state)) errors.state = t('account_address_error_location')
    if (validateRequired(address.postalCode)) errors.postalCode = t('account_address_error_required')
    if (validateRequired(address.country)) errors.country = t('account_address_error_required')
    return errors
  }

  const saveAddress = (event) => {
    event.preventDefault()
    const errors = validateAddress(addressForm)
    setAddressErrors(errors)
    setAddressTouched(Object.fromEntries(ADDRESS_FIELDS.map(({ name }) => [name, true])))
    if (Object.keys(errors).length) return

    const nextAddresses = [
      ...savedAddresses.addresses,
      { ...addressForm, id: `${Date.now()}` },
    ]
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextAddresses))
      setSavedAddresses({ addresses: nextAddresses, storageError: false })
      setAddressForm(EMPTY_ADDRESS)
      setAddressFormOpen(false)
      setAddressErrors({})
      setAddressTouched({})
    } catch (error) {
      console.error('Unable to save address to local storage.', error)
      setSavedAddresses((current) => ({ ...current, storageError: true }))
    }
  }

  const removeAddress = (id) => {
    const nextAddresses = savedAddresses.addresses.filter((address) => address.id !== id)
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextAddresses))
      setSavedAddresses({ addresses: nextAddresses, storageError: false })
    } catch (error) {
      console.error('Unable to remove saved address from local storage.', error)
      setSavedAddresses((current) => ({ ...current, storageError: true }))
    }
  }

  const formatDate = (date) =>
    new Intl.DateTimeFormat(locale === 'es' ? 'es' : 'en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(`${date}T12:00:00`))

  const formatPrice = (price) =>
    new Intl.NumberFormat(locale === 'es' ? 'es' : 'en', {
      style: 'currency',
      currency: 'USD',
    }).format(price)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-serif text-3xl font-bold text-cacao-900">My Account</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                tab === id ? 'bg-cacao-700 text-white' : 'text-cacao-600 hover:bg-cacao-100'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
          <button
            onClick={logout}
            className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-500 hover:bg-red-50"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </aside>

        <div className="rounded-2xl border border-cacao-100 bg-white p-6">
          {tab === 'profile' && (
            <div className="flex flex-col gap-4">
              <h2 className="font-serif text-lg font-semibold text-cacao-900">Profile Details</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="account-first-name" className="text-xs font-medium text-cacao-500">First Name</label>
                  <input
                    id="account-first-name"
                    defaultValue={user.firstName}
                    className="mt-1 w-full rounded-lg border border-cacao-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="account-email" className="text-xs font-medium text-cacao-500">Email</label>
                  <input
                    id="account-email"
                    defaultValue={user.email}
                    className="mt-1 w-full rounded-lg border border-cacao-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="account-type" className="text-xs font-medium text-cacao-500">Account Type</label>
                  <input
                    id="account-type"
                    disabled
                    value={user.accountType === 'b2b' ? 'Business / Wholesale' : 'Individual / Retail'}
                    className="mt-1 w-full rounded-lg border border-cacao-200 bg-cacao-50 px-3 py-2 text-sm text-cacao-500"
                  />
                </div>
              </div>
              <button className="w-fit rounded-full bg-cacao-700 px-5 py-2 text-sm font-semibold text-white hover:bg-cacao-600">
                Save Changes
              </button>
            </div>
          )}

          {tab === 'addresses' && (
            <div className="flex flex-col gap-4">
              <h2 className="font-serif text-lg font-semibold text-cacao-900">{t('account_addresses_title')}</h2>
              {savedAddresses.storageError && (
                <p role="alert" className="text-sm text-red-600">{t('account_address_storage_error')}</p>
              )}
              {savedAddresses.addresses.length === 0 && (
                <p className="text-sm text-cacao-500">{t('account_addresses_empty')}</p>
              )}
              {savedAddresses.addresses.map((address) => (
                <article key={address.id} className="flex items-start justify-between gap-4 rounded-xl border border-cacao-100 p-4">
                  <div className="text-sm text-cacao-700">
                    <p className="font-semibold text-cacao-900">{address.name}</p>
                    <p>{address.street}</p>
                    <p>{address.city}, {address.state} {address.postalCode}</p>
                    <p>{address.country}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAddress(address.id)}
                    aria-label={t('account_address_remove')}
                    className="rounded-lg p-2 text-cacao-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              ))}
              {addressFormOpen ? (
                <form onSubmit={saveAddress} noValidate className="grid grid-cols-1 gap-4 rounded-xl border border-cacao-100 p-4 sm:grid-cols-2">
                  {ADDRESS_FIELDS.map(({ name, translation }) => {
                    const errorId = `account-address-${name}-error`
                    return (
                      <div key={name} className={name === 'street' ? 'sm:col-span-2' : ''}>
                        <label htmlFor={`account-address-${name}`} className="text-xs font-medium text-cacao-500">
                          {t(translation)}
                        </label>
                        <input
                          id={`account-address-${name}`}
                          autoComplete={name === 'street' ? 'street-address' : name === 'postalCode' ? 'postal-code' : name}
                          value={addressForm[name]}
                          onChange={(event) => {
                            const value = event.target.value
                            const nextForm = { ...addressForm, [name]: value }
                            setAddressForm(nextForm)
                            if (addressTouched[name]) {
                              setAddressErrors(validateAddress(nextForm))
                            }
                          }}
                          onBlur={() => {
                            setAddressTouched((current) => ({ ...current, [name]: true }))
                            setAddressErrors(validateAddress(addressForm))
                          }}
                          aria-invalid={Boolean(addressTouched[name] && addressErrors[name])}
                          aria-describedby={addressTouched[name] && addressErrors[name] ? errorId : undefined}
                          className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-cacao-500 ${
                            addressTouched[name] && addressErrors[name] ? 'border-red-400' : 'border-cacao-200'
                          }`}
                        />
                        {addressTouched[name] && addressErrors[name] && (
                          <p id={errorId} className="mt-1 text-xs text-red-600">{addressErrors[name]}</p>
                        )}
                      </div>
                    )
                  })}
                  <div className="flex gap-3 sm:col-span-2">
                    <button type="submit" className="rounded-full bg-cacao-700 px-5 py-2 text-sm font-semibold text-white hover:bg-cacao-600">
                      {t('account_address_save')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddressFormOpen(false)
                        setAddressForm(EMPTY_ADDRESS)
                        setAddressErrors({})
                        setAddressTouched({})
                      }}
                      className="rounded-full border border-cacao-300 px-5 py-2 text-sm font-semibold text-cacao-700 hover:bg-cacao-100"
                    >
                      {t('account_address_cancel')}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddressFormOpen(true)}
                  className="flex w-fit items-center gap-2 rounded-full border border-cacao-300 px-5 py-2 text-sm font-semibold text-cacao-700 hover:bg-cacao-100"
                >
                  <Plus size={16} />
                  {t('account_address_add')}
                </button>
              )}
            </div>
          )}

          {tab === 'orders' && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="font-serif text-lg font-semibold text-cacao-900">{t('account_orders_title')}</h2>
                <p className="mt-1 text-sm text-cacao-500">{t('account_orders_sample_notice')}</p>
              </div>
              <div className="flex flex-col gap-4">
                {SAMPLE_ORDERS.map((order) => (
                  <article key={order.number} className="rounded-xl border border-cacao-100 p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-cacao-100 pb-4">
                      <div>
                        <h3 className="font-semibold text-cacao-900">
                          {t('account_order_number')} {order.number}
                        </h3>
                        <p className="mt-1 text-sm text-cacao-500">
                          {t('account_order_date')}: {formatDate(order.date)}
                        </p>
                      </div>
                      <span className="rounded-full bg-gold-300/20 px-3 py-1 text-xs font-semibold text-cacao-800">
                        {t(`account_order_status_${order.status}`)}
                      </span>
                    </div>
                    <ul className="flex flex-col gap-2 py-4 text-sm">
                      {order.items.map((item) => (
                        <li key={item.nameEn} className="flex justify-between gap-4 text-cacao-600">
                          <span>{locale === 'es' ? item.nameEs : item.nameEn}</span>
                          <span className="shrink-0">× {item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between border-t border-cacao-100 pt-3 text-sm font-semibold text-cacao-900">
                      <span>{t('account_order_total')}</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
