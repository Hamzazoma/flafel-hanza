import { CircleAlert, Clock4, ReceiptText } from 'lucide-react'

import { menuItems, type Locale, type ServiceType } from '@/data/shop'
import { buildOrderLines, calculateItemCount, formatPrice, type OrderValidationErrors } from '@/utils/order'

type OrderSummaryCardProps = {
  locale: Locale
  selectedItems: Record<string, number>
  serviceType: ServiceType
  pickupTime: string
  totalPrice: number
  errors: OrderValidationErrors
}

const copy = {
  ar: {
    title: 'ملخص الطلب',
    empty: 'لم تختر أي صنف بعد',
    pickup: 'استلام من المحل',
    delivery: 'توصيل',
    total: 'الإجمالي',
    items: 'عدد القطع',
    orderError: 'يوجد عنصر ناقص قبل الإرسال',
  },
  en: {
    title: 'Order summary',
    empty: 'No items selected yet',
    pickup: 'Pickup',
    delivery: 'Delivery',
    total: 'Total',
    items: 'Items',
    orderError: 'Something is missing before sending the order',
  },
}

const menuItemMap = new Map(menuItems.map((item) => [item.id, item]))

export default function OrderSummaryCard({
  locale,
  selectedItems,
  serviceType,
  pickupTime,
  totalPrice,
  errors,
}: OrderSummaryCardProps) {
  const text = copy[locale]
  const lines = buildOrderLines(selectedItems)
  const totalItems = calculateItemCount(selectedItems)

  return (
    <section className="rounded-[32px] border border-brand-gold/20 bg-brand-gold/10 p-6 shadow-[0_24px_80px_rgba(7,10,13,0.24)]">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-brand-gold p-3 text-brand-ink">
          <ReceiptText className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-ink/70">
            {locale === 'ar' ? 'الخطوة الثالثة' : 'Step three'}
          </p>
          <h2 className="text-2xl font-bold text-brand-ink">{text.title}</h2>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 text-sm text-brand-ink/80">
        <span className="rounded-full border border-brand-ink/10 bg-white/35 px-3 py-1">
          {serviceType === 'pickup' ? text.pickup : text.delivery}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-ink/10 bg-white/35 px-3 py-1">
          <Clock4 className="h-4 w-4" />
          {pickupTime}
        </span>
      </div>

      <div className="grid gap-3">
        {lines.length === 0 ? (
          <div className="rounded-[24px] border border-brand-ink/10 bg-white/35 px-4 py-5 text-sm text-brand-ink/65">
            {text.empty}
          </div>
        ) : (
          lines.map((line) => {
            const item = menuItemMap.get(line.itemId)

            if (!item) {
              return null
            }

            return (
              <div
                key={line.itemId}
                className="flex items-center justify-between gap-3 rounded-[24px] border border-brand-ink/10 bg-white/35 px-4 py-4"
              >
                <div>
                  <p className="font-semibold text-brand-ink">{item.name[locale]}</p>
                  <p className="text-xs text-brand-ink/60">
                    {line.quantity} x {formatPrice(item.price, locale)}
                  </p>
                </div>
                <p className="font-bold text-brand-ink">{formatPrice(item.price * line.quantity, locale)}</p>
              </div>
            )
          })
        )}
      </div>

      <div className="mt-5 grid gap-2 rounded-[24px] border border-brand-ink/10 bg-brand-ink px-4 py-5 text-brand-sand">
        <div className="flex items-center justify-between text-sm text-brand-sand/70">
          <span>{text.items}</span>
          <span>{totalItems}</span>
        </div>
        <div className="flex items-center justify-between text-lg font-bold">
          <span>{text.total}</span>
          <span>{formatPrice(totalPrice, locale)}</span>
        </div>
      </div>

      {errors.items ? (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-clay/30 bg-brand-clay/10 px-4 py-2 text-sm text-brand-ink">
          <CircleAlert className="h-4 w-4" />
          {locale === 'ar' ? errors.items : text.orderError}
        </div>
      ) : null}
    </section>
  )
}
