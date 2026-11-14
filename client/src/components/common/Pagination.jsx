import { useLocale } from '../../context/LocaleContext'

export const PRODUCTS_PER_PAGE = 6

export default function Pagination({ page, totalPages, onPageChange }) {
  const { locale } = useLocale()

  if (totalPages <= 1) return null

  const previousLabel = locale === 'es' ? 'Anterior' : 'Previous'
  const nextLabel = locale === 'es' ? 'Siguiente' : 'Next'
  const pageLabel = locale === 'es' ? `Página ${page} de ${totalPages}` : `Page ${page} of ${totalPages}`

  return (
    <nav aria-label={locale === 'es' ? 'Páginas de productos' : 'Product pages'} className="mt-8 flex items-center justify-center gap-4">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-full border border-cacao-200 px-4 py-2 text-sm text-cacao-700 hover:bg-cacao-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {previousLabel}
      </button>
      <span aria-live="polite" className="text-sm text-cacao-600">
        {pageLabel}
      </span>
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-full border border-cacao-200 px-4 py-2 text-sm text-cacao-700 hover:bg-cacao-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {nextLabel}
      </button>
    </nav>
  )
}
