import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { ToastContext } from './ToastContext'

export default function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const nextId = useRef(0)

  const showToast = useCallback((message, type = 'success') => {
    nextId.current += 1
    setToast({ id: nextId.current, message, type })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  useEffect(() => {
    if (!toast) return undefined
    const timeoutId = window.setTimeout(dismissToast, 4000)
    return () => window.clearTimeout(timeoutId)
  }, [toast, dismissToast])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div
          key={toast.id}
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
          className={`fixed right-4 top-4 z-[60] flex max-w-sm items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm text-cacao-800 shadow-lg ${
            toast.type === 'error' ? 'border-red-200' : 'border-green-200'
          }`}
        >
          {toast.type === 'error' ? (
            <X size={20} className="shrink-0 text-red-600" aria-hidden="true" />
          ) : (
            <CheckCircle2 size={20} className="shrink-0 text-green-600" aria-hidden="true" />
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={dismissToast}
            aria-label="Dismiss notification"
            className="shrink-0 rounded p-1 text-cacao-500 hover:bg-cacao-100"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  )
}
