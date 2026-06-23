import { Flame, Sparkles } from 'lucide-react'

import { type Locale, type MenuItem } from '@/data/shop'
import { formatCalories, formatPrice } from '@/utils/order'

type MenuItemCardProps = {
  item: MenuItem
  locale: Locale
}

export default function MenuItemCard({ item, locale }: MenuItemCardProps) {
  return (
    <article className="group rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-brand-clay/50 hover:bg-white/[0.07]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-brand-sand">{item.name[locale]}</h3>
          {item.description ? <p className="mt-2 text-sm text-brand-sand/65">{item.description[locale]}</p> : null}
        </div>

        {item.popular ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold px-3 py-1 text-xs font-bold text-brand-ink">
            <Sparkles className="h-3.5 w-3.5" />
            {locale === 'ar' ? 'شائع' : 'Popular'}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-brand-sand/75">
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 font-semibold text-brand-gold">
          {formatPrice(item.price, locale)}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
          <Flame className="h-4 w-4 text-brand-clay" />
          {formatCalories(item.calories, locale)}
        </span>
      </div>
    </article>
  )
}
