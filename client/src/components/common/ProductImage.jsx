import { useState } from 'react'
import { useLocale } from '../../context/LocaleContext'
import { getSwatch } from '../../utils/productSwatch'

function BarIcon({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="20" width="80" height="60" rx="6" fill="white" fillOpacity="0.92" />
      <path d="M30 20V80M50 20V80M70 20V80" stroke="black" strokeOpacity="0.14" strokeWidth="2" />
      <path d="M10 50H90" stroke="black" strokeOpacity="0.14" strokeWidth="2" />
      <rect x="44" y="43" width="12" height="14" rx="2" fill="black" fillOpacity="0.16" />
    </svg>
  )
}

function TruffleIcon({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="58" width="76" height="26" rx="7" fill="white" fillOpacity="0.85" />
      <circle cx="32" cy="52" r="16" fill="white" fillOpacity="0.95" />
      <circle cx="60" cy="47" r="18" fill="white" fillOpacity="0.95" />
      <circle cx="82" cy="54" r="12.5" fill="white" fillOpacity="0.9" />
      <circle cx="27" cy="46" r="2" fill="black" fillOpacity="0.16" />
      <circle cx="56" cy="40" r="2.2" fill="black" fillOpacity="0.16" />
      <circle cx="78" cy="48" r="1.8" fill="black" fillOpacity="0.16" />
    </svg>
  )
}

function SeasonalBarIcon({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="20" width="80" height="60" rx="6" fill="white" fillOpacity="0.92" />
      <rect x="44" y="20" width="12" height="60" fill="black" fillOpacity="0.12" />
      <rect x="10" y="44" width="80" height="12" fill="black" fillOpacity="0.12" />
      <path
        d="M50 44 C38 30, 20 34, 28 46 C34 54, 46 50, 50 44 Z"
        fill="black"
        fillOpacity="0.18"
      />
      <path
        d="M50 44 C62 30, 80 34, 72 46 C66 54, 54 50, 50 44 Z"
        fill="black"
        fillOpacity="0.18"
      />
      <circle cx="50" cy="44" r="5" fill="black" fillOpacity="0.22" />
    </svg>
  )
}

const ICONS = {
  bar: BarIcon,
  truffle: TruffleIcon,
  seasonal: SeasonalBarIcon,
}

export default function ProductImage({ product, className = '', iconClassName = 'h-2/3 w-2/3' }) {
  const Icon = ICONS[product.productType] || BarIcon
  const { locale } = useLocale()
  const [imageFailed, setImageFailed] = useState(false)
  const name = locale === 'es' ? product.nameEs : product.nameEn
  const hasPhoto = Boolean(product.imageUrl) && !imageFailed
  const swatch = getSwatch(product)

  return (
    <div
      {...(!hasPhoto ? { role: 'img', 'aria-label': name } : {})}
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${swatch} ${className}`}
    >
      {hasPhoto ? (
        <img
          src={product.imageUrl}
          alt={name}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <Icon className={iconClassName} />
      )}
    </div>
  )
}
