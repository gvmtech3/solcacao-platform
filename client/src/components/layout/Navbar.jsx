import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Search, ShoppingBag, User, Globe } from 'lucide-react'
import { useLocale } from '../../context/LocaleContext'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import useEscapeKey from '../../hooks/useEscapeKey'

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition hover:text-cacao-600 ${
    isActive ? 'text-cacao-900' : 'text-cacao-500'
  }`

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const { locale, toggleLocale, t } = useLocale()
  const { itemCount, openDrawer } = useCart()
  const { isAuthenticated, user, openLogin, logout } = useAuth()

  useEscapeKey(mobileOpen, () => setMobileOpen(false))
  useEscapeKey(searchOpen, () => setSearchOpen(false))

  const showRetailNav = !isAuthenticated || user.accountType === 'retail'
  const showB2BNav = !isAuthenticated || user.accountType === 'b2b'

  const navLinks = [
    showRetailNav && { to: '/shop', label: t('nav_shop') },
    showB2BNav && { to: '/b2b', label: t('nav_b2b') },
    showRetailNav && { to: '/sampler', label: t('nav_sampler') },
    { to: '/contact', label: t('nav_contact') },
    { to: '/about', label: t('nav_about') },
  ].filter(Boolean)

  const submitSearch = (event) => {
    event.preventDefault()
    const query = searchTerm.trim()
    navigate(query ? `/shop?search=${encodeURIComponent(query)}` : '/shop')
    setSearchOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-cacao-100 bg-cream-50/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="p-2 text-cacao-700 md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <Link to="/" className="font-serif text-xl font-bold tracking-tight text-cacao-900">
          SolCacao
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {showRetailNav && (
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="rounded-full p-2 text-cacao-700 hover:bg-cacao-100"
              aria-label="Search"
            >
              <Search size={19} />
            </button>
          )}

          <button
            type="button"
            onClick={toggleLocale}
            className="hidden items-center gap-1 rounded-full px-2 py-1.5 text-xs font-semibold text-cacao-700 hover:bg-cacao-100 sm:flex"
            aria-label="Toggle language"
          >
            <Globe size={16} />
            {locale.toUpperCase()}
          </button>

          {isAuthenticated ? (
            <Link
              to="/account"
              className="hidden items-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-semibold text-cacao-700 hover:bg-cacao-100 sm:flex"
            >
              <User size={16} />
              {user.firstName}
            </Link>
          ) : (
            <button
              type="button"
              onClick={openLogin}
              className="hidden items-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-semibold text-cacao-700 hover:bg-cacao-100 sm:flex"
            >
              <User size={16} />
              {t('nav_login')}
            </button>
          )}

          {showRetailNav && (
            <button
              type="button"
              onClick={openDrawer}
              className="relative rounded-full p-2 text-cacao-700 hover:bg-cacao-100"
              aria-label="Open cart"
            >
              <ShoppingBag size={19} />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-cacao-700 px-1 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {searchOpen && (
        <form
          onSubmit={submitSearch}
          className="flex gap-2 border-t border-cacao-100 bg-white px-4 py-3 sm:px-6 lg:px-8"
        >
          <label htmlFor="site-search" className="sr-only">
            {t('nav_search_placeholder')}
          </label>
          <input
            id="site-search"
            type="search"
            autoFocus
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t('nav_search_placeholder')}
            className="w-full rounded-full border border-cacao-200 px-4 py-2 text-sm outline-none focus:border-cacao-500"
          />
          <button
            type="submit"
            className="rounded-full bg-cacao-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-cacao-600"
          >
            {t('nav_search_submit')}
          </button>
        </form>
      )}

      {mobileOpen && createPortal(
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
        >
          <div
            className="absolute inset-0 bg-cacao-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col gap-6 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <span id="mobile-menu-title" className="font-serif text-lg font-bold text-cacao-900">SolCacao</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1 text-cacao-700"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium text-cacao-700"
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3 border-t border-cacao-100 pt-4">
              <button
                type="button"
                onClick={toggleLocale}
                className="flex items-center gap-2 text-sm font-semibold text-cacao-700"
              >
                <Globe size={16} />
                {locale === 'en' ? 'Español' : 'English'}
              </button>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-sm font-semibold text-cacao-700"
                  >
                    <User size={16} />
                    {t('nav_account')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setMobileOpen(false)
                    }}
                    className="flex items-center gap-2 text-sm font-semibold text-cacao-700"
                  >
                    <User size={16} />
                    Log Out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    openLogin()
                    setMobileOpen(false)
                  }}
                  className="flex items-center gap-2 text-sm font-semibold text-cacao-700"
                >
                  <User size={16} />
                  {t('nav_login')}
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  )
}
