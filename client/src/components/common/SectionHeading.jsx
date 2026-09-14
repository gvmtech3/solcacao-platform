export default function SectionHeading({ eyebrow, title, subtitle, align = 'left' }) {
  const alignment = align === 'center' ? 'text-center items-center' : 'text-left items-start'

  return (
    <div className={`flex flex-col gap-2 ${alignment}`}>
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-bold text-cacao-900 sm:text-4xl">{title}</h2>
      {subtitle && <p className="max-w-2xl text-cacao-600">{subtitle}</p>}
    </div>
  )
}
