import type { ReactNode } from 'react'
import { Minus, Plus } from 'lucide-react'

import MenuCategoryTabs from '@/components/MenuCategoryTabs'
import { categoryLabels, menuItems, type Locale, type MenuCategory } from '@/data/shop'
import { formatCalories, formatPrice, getItemQuantity } from '@/utils/order'

type OrderBuilderProps = {
  activeCategory: MenuCategory
  locale: Locale
  selectedItems: Record<string, number>
  onSelectCategory: (category: MenuCategory) => void
  onUpdateQuantity: (itemId: string, quantity: number) => void
}

export default function OrderBuilder({
  activeCategory,
  locale,
  selectedItems,
  onSelectCategory,
  onUpdateQuantity,
}: OrderBuilderProps) {
  const items = menuItems.filter((item) => item.category === activeCategory)

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(7,10,13,0.24)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold/80">
            {locale === 'ar' ? 'ابدأ الطلب' : 'Start your order'}
          </p>
          <h2 className="text-2xl font-bold text-brand-sand">
            {locale === 'ar' ? 'اختر القسم ثم عدّل الكمية' : 'Choose a category and update quantity'}
          </h2>
        </div>

        <MenuCategoryTabs activeCategory={activeCategory} locale={locale} onSelect={onSelectCategory} />

        <div className="grid gap-4">
          {items.map((item) => {
            const quantity = getItemQuantity(selectedItems, item.id)

            return (
              <article
                key={item.id}
                className="grid gap-4 rounded-[24px] border border-white/10 bg-black/20 p-4 lg:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand-clay/10 px-3 py-1 text-xs font-semibold text-brand-clay">
                      {categoryLabels[item.category][locale]}
                    </span>
                    {item.popular ? (
                      <span className="rounded-full bg-brand-gold px-3 py-1 text-xs font-bold text-brand-ink">
                        {locale === 'ar' ? 'الأكثر طلبا' : 'Best seller'}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-lg font-bold text-brand-sand">{item.name[locale]}</h3>
                  {item.description ? <p className="mt-1 text-sm text-brand-sand/65">{item.description[locale]}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-brand-sand/70">
                    <span>{formatPrice(item.price, locale)}</span>
                    <span>{formatCalories(item.calories, locale)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-center">
                  <QuantityButton
                    label={locale === 'ar' ? 'تقليل' : 'Decrease'}
                    onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                    icon={<Minus className="h-4 w-4" />}
                  />
                  <span className="min-w-10 text-center text-lg font-bold text-brand-sand">{quantity}</span>
                  <QuantityButton
                    label={locale === 'ar' ? 'زيادة' : 'Increase'}
                    onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                    icon={<Plus className="h-4 w-4" />}
                  />
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

type QuantityButtonProps = {
  label: string
  onClick: () => void
  icon: ReactNode
}

function QuantityButton({ label, onClick, icon }: QuantityButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-brand-sand transition hover:border-brand-gold/40 hover:bg-brand-gold/10"
    >
      {icon}
    </button>
  )
}
