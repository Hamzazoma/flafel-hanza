import { Link } from 'react-router-dom'
import { CheckCircle2, ChevronLeft, ShoppingBag } from 'lucide-react'

import { menuItems } from '@/data/shop'
import { useShopStore } from '@/store/useShopStore'
import { buildOrderLines, formatPrice } from '@/utils/order'

const copy = {
  ar: {
    title: 'تم إرسال الطلب بنجاح',
    subtitle: 'تم حفظ الطلب وإرساله إلى لوحة الإدارة، ويمكنك الآن العودة للمنيو أو بدء طلب جديد.',
    home: 'العودة إلى الموقع التعريفي',
    orders: 'ابدأ طلبا جديدا',
    number: 'رقم الطلب',
    total: 'الإجمالي',
    service: 'الخدمة',
    pickup: 'استلام من المحل',
    delivery: 'توصيل',
    empty: 'لا يوجد طلب محفوظ حاليا.',
  },
  en: {
    title: 'Order sent successfully',
    subtitle: 'The order has been saved and sent to the admin dashboard. You can return to the menu or start a new request.',
    home: 'Back to the showcase site',
    orders: 'Start a new order',
    number: 'Order number',
    total: 'Total',
    service: 'Service',
    pickup: 'Pickup',
    delivery: 'Delivery',
    empty: 'There is no saved order yet.',
  },
}

const itemMap = new Map(menuItems.map((item) => [item.id, item]))

export default function Success() {
  const locale = useShopStore((state) => state.locale)
  const lastSubmittedOrder = useShopStore((state) => state.lastSubmittedOrder)
  const resetOrder = useShopStore((state) => state.resetOrder)
  const isArabic = locale === 'ar'
  const text = copy[locale]

  if (!lastSubmittedOrder) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-[40px] border border-white/10 bg-white/5 p-10">
          <p className="text-lg text-brand-sand/75">{text.empty}</p>
          <Link
            to="/orders"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-gold px-6 py-3 text-sm font-bold text-brand-ink transition hover:bg-brand-gold-soft"
          >
            {text.orders}
            <ChevronLeft className={`h-4 w-4 ${isArabic ? '' : 'rotate-180'}`} />
          </Link>
        </div>
      </div>
    )
  }

  const lines = buildOrderLines(lastSubmittedOrder.selectedItems)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-[40px] border border-brand-gold/20 bg-gradient-to-br from-brand-gold/15 via-white/5 to-transparent p-8 shadow-[0_32px_120px_rgba(7,10,13,0.28)] sm:p-10">
        <div className="mb-8 flex items-start gap-4">
          <div className="rounded-3xl bg-brand-gold p-4 text-brand-ink">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-gold/80">
              {isArabic ? 'نجاح العملية' : 'Success'}
            </p>
            <h1 className="mt-3 font-display text-5xl leading-tight text-brand-sand">{text.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-brand-sand/70">{text.subtitle}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryTile label={text.number} value={lastSubmittedOrder.id} />
          <SummaryTile label={text.total} value={formatPrice(lastSubmittedOrder.totalPrice, locale)} />
          <SummaryTile label={text.service} value={lastSubmittedOrder.serviceType === 'pickup' ? text.pickup : text.delivery} />
        </div>

        <div className="mt-6 rounded-[32px] border border-white/10 bg-brand-ink/70 p-6">
          <div className="mb-4 flex items-center justify-between gap-3 text-sm text-brand-sand/70">
            <span>{text.service}</span>
            <span>{lastSubmittedOrder.serviceType === 'pickup' ? text.pickup : text.delivery}</span>
          </div>
          <div className="grid gap-3">
            {lines.map((line) => {
              const item = itemMap.get(line.itemId)

              if (!item) {
                return null
              }

              return (
                <div
                  key={line.itemId}
                  className="flex items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/5 px-4 py-4"
                >
                  <div>
                    <p className="font-semibold text-brand-sand">{item.name[locale]}</p>
                    <p className="text-xs text-brand-sand/55">{line.quantity} x {formatPrice(item.price, locale)}</p>
                  </div>
                  <p className="font-bold text-brand-gold">{formatPrice(item.price * line.quantity, locale)}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-brand-sand transition hover:border-brand-clay/40 hover:bg-brand-clay/10"
          >
            {text.home}
            <ChevronLeft className={`h-4 w-4 ${isArabic ? '' : 'rotate-180'}`} />
          </Link>
          <Link
            to="/orders"
            onClick={resetOrder}
            className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-6 py-3 text-sm font-bold text-brand-ink transition hover:bg-brand-gold-soft"
          >
            <ShoppingBag className="h-4 w-4" />
            {text.orders}
          </Link>
        </div>
      </section>
    </div>
  )
}

type SummaryTileProps = {
  label: string
  value: string
}

function SummaryTile({ label, value }: SummaryTileProps) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/5 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold/80">{label}</p>
      <p className="mt-3 text-lg font-bold text-brand-sand">{value}</p>
    </article>
  )
}
