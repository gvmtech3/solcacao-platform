import { Leaf, Users, Globe2 } from 'lucide-react'

const VALUES = [
  {
    icon: Leaf,
    title: 'Organic Sourcing',
    body: 'Every bean is grown without synthetic pesticides, sourced directly from small-scale farms.',
  },
  {
    icon: Users,
    title: 'Farmer Partnerships',
    body: 'We pay above fair-trade minimums and build long-term relationships with our growing partners.',
  },
  {
    icon: Globe2,
    title: 'Single-Origin Integrity',
    body: 'Each bar traces back to one region, preserving the distinct character of its terroir.',
  },
]

export default function About() {
  return (
    <div className="flex flex-col gap-16 pb-20">
      <section className="bg-cacao-100">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-600">Our Story</span>
          <h1 className="mt-4 font-serif text-4xl font-bold text-cacao-900">Chocolate, Crafted With Intention</h1>
          <p className="mx-auto mt-5 max-w-2xl text-cacao-600">
            SolCacao began with a simple belief: exceptional chocolate starts with exceptional cacao.
            We work directly with growers across Latin America, West Africa, and Southeast Asia to
            bring small-batch, single-origin chocolate to both your table and your brand.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="sr-only">Our Values</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col items-start gap-3 rounded-2xl border border-cacao-100 bg-white p-6">
              <Icon className="text-gold-600" size={28} />
              <h3 className="font-serif text-lg font-semibold text-cacao-900">{title}</h3>
              <p className="text-sm text-cacao-600">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
