import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, ApiError } from '../utils/apiClient'

const AuthContext = createContext(null)

function normalizeUser(user) {
  return user ? { ...user, id: user._id } : null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const [isModalOpen, setModalOpen] = useState(false)
  const [modalView, setModalView] = useState('login')

  useEffect(() => {
    let cancelled = false
    api
      .get('/auth/me')
      .then((data) => {
        if (!cancelled) setUser(normalizeUser(data.user))
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      authLoading,
      authError,
      login: async ({ email, password }) => {
        setAuthError(null)
        try {
          const data = await api.post('/auth/login', { email, password })
          setUser(normalizeUser(data.user))
          setModalOpen(false)
          return true
        } catch (err) {
          setAuthError(err instanceof ApiError ? err.message : 'Unable to log in.')
          return false
        }
      },
      register: async ({ email, password, firstName, lastName, accountType = 'retail' }) => {
        setAuthError(null)
        try {
          await api.post('/auth/register', {
            email,
            password,
            firstName,
            lastName,
            accountType,
          })
          return true
        } catch (err) {
          setAuthError(err instanceof ApiError ? err.message : 'Unable to create an account.')
          return false
        }
      },
      updateFirstName: async (firstName) => {
        try {
          const data = await api.patch('/account/profile', { firstName })
          setUser(normalizeUser(data.user))
          return true
        } catch {
          return false
        }
      },
      logout: async () => {
        try {
          await api.post('/auth/logout')
        } finally {
          setUser(null)
        }
      },
      clearAuthError: () => setAuthError(null),
      isModalOpen,
      modalView,
      openLogin: () => {
        setModalView('login')
        setAuthError(null)
        setModalOpen(true)
      },
      openRegister: () => {
        setModalView('register')
        setAuthError(null)
        setModalOpen(true)
      },
      closeModal: () => setModalOpen(false),
      setModalView,
    }),
    [user, authLoading, authError, isModalOpen, modalView]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
