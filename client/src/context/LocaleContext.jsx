import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from '../data/translations'

const LocaleContext = createContext(null)

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState('en')

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo(() => {
    const dict = translations[locale]
    const t = (key) => dict[key] ?? key
    const toggleLocale = () => setLocale((prev) => (prev === 'en' ? 'es' : 'en'))
    return { locale, setLocale, toggleLocale, t }
  }, [locale])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider')
  return ctx
}
