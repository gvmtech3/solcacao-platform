import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { User, MapPin, Package, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'orders', label: 'Order History', icon: Package },
]

export default function Account() {
  const { user, isAuthenticated, logout } = useAuth()
  const [tab, setTab] = useState('profile')

  if (!isAuthenticated) return <Navigate to="/" replace />

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
              <h2 className="font-serif text-lg font-semibold text-cacao-900">Saved Addresses</h2>
              <p className="text-sm text-cacao-500">You haven't saved any addresses yet.</p>
              <button className="w-fit rounded-full border border-cacao-300 px-5 py-2 text-sm font-semibold text-cacao-700 hover:bg-cacao-100">
                Add Address
              </button>
            </div>
          )}

          {tab === 'orders' && (
            <div className="flex flex-col gap-4">
              <h2 className="font-serif text-lg font-semibold text-cacao-900">Order History</h2>
              <p className="text-sm text-cacao-500">You haven't placed any orders yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
