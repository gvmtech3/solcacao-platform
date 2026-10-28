import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isModalOpen, setModalOpen] = useState(false)
  const [modalView, setModalView] = useState('login')

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login: ({ email, accountType = 'retail' }) => {
        setUser({ email, accountType, firstName: email.split('@')[0] })
        setModalOpen(false)
      },
      register: ({ email, firstName, accountType = 'retail' }) => {
        setUser({ email, firstName, accountType })
        setModalOpen(false)
      },
      updateFirstName: (firstName) => {
        setUser((currentUser) =>
          currentUser ? { ...currentUser, firstName } : currentUser
        )
      },
      logout: () => setUser(null),
      isModalOpen,
      modalView,
      openLogin: () => {
        setModalView('login')
        setModalOpen(true)
      },
      openRegister: () => {
        setModalView('register')
        setModalOpen(true)
      },
      closeModal: () => setModalOpen(false),
      setModalView,
    }),
    [user, isModalOpen, modalView]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
