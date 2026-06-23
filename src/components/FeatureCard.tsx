import type { ReactNode } from 'react'

type FeatureCardProps = {
  title: string
  description?: string
  icon: ReactNode
}

export default function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(7,10,13,0.22)]">
      <div className="mb-4 inline-flex rounded-2xl border border-brand-gold/20 bg-brand-gold/10 p-3 text-brand-gold">
        {icon}
      </div>
      <h3 className="text-base font-bold text-brand-sand">{title}</h3>
      {description ? <p className="mt-2 text-sm leading-6 text-brand-sand/65">{description}</p> : null}
    </article>
  )
}
