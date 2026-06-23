import { categoryLabels, type Locale, type MenuCategory } from '@/data/shop'
import { cn } from '@/lib/utils'

type MenuCategoryTabsProps = {
  activeCategory: MenuCategory
  locale: Locale
  onSelect: (category: MenuCategory) => void
}

const orderedCategories: MenuCategory[] = ['sandwiches', 'pies', 'plates', 'boxes', 'drinks']

export default function MenuCategoryTabs({
  activeCategory,
  locale,
  onSelect,
}: MenuCategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {orderedCategories.map((category) => {
        const active = activeCategory === category

        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-semibold transition sm:px-5',
              active
                ? 'border-brand-gold bg-brand-gold text-brand-ink shadow-[0_12px_36px_rgba(217,176,97,0.25)]'
                : 'border-white/10 bg-white/5 text-brand-sand/75 hover:border-brand-clay/60 hover:bg-brand-clay/10 hover:text-brand-sand',
            )}
          >
            {categoryLabels[category][locale]}
          </button>
        )
      })}
    </div>
  )
}
