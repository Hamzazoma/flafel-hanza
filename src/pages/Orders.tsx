import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import OrderBuilder from '@/components/OrderBuilder'
import OrderFormCard from '@/components/OrderFormCard'
import OrderSummaryCard from '@/components/OrderSummaryCard'
import { defaultMenuAvailabilityMap, orderImageUrl, siteContent, type MenuCategory } from '@/data/shop'
import { fetchMenuAvailability, submitRemoteOrder, type MenuAvailabilityMap } from '@/lib/orderApi'
import { useShopStore } from '@/store/useShopStore'
import { calculateTotal, validateOrder, type OrderValidationErrors } from '@/utils/order'

export default function Orders() {
  const navigate = useNavigate()
  const locale = useShopStore((state) => state.locale)
  const selectedItems = useShopStore((state) => state.selectedItems)
  const customerName = useShopStore((state) => state.customerName)
  const phone = useShopStore((state) => state.phone)
  const address = useShopStore((state) => state.address)
  const notes = useShopStore((state) => state.notes)
  const serviceType = useShopStore((state) => state.serviceType)
  const setQuantity = useShopStore((state) => state.setQuantity)
  const updateField = useShopStore((state) => state.updateField)
  const setServiceType = useShopStore((state) => state.setServiceType)
  const completeSubmittedOrder = useShopStore((state) => state.completeSubmittedOrder)
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('sandwiches')
  const [errors, setErrors] = useState<OrderValidationErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availabilityMap, setAvailabilityMap] = useState<MenuAvailabilityMap>(defaultMenuAvailabilityMap)
  const isArabic = locale === 'ar'

  useEffect(() => {
    let active = true

    fetchMenuAvailability()
      .then((nextAvailabilityMap) => {
        if (active) {
          setAvailabilityMap(nextAvailabilityMap)
        }
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    Object.entries(selectedItems).forEach(([itemId, quantity]) => {
      if (quantity > 0 && availabilityMap[itemId] === false) {
        setQuantity(itemId, 0)
      }
    })
  }, [availabilityMap, selectedItems, setQuantity])

  const availableSelectedItems = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(selectedItems).filter(([itemId, quantity]) => quantity > 0 && availabilityMap[itemId] !== false),
      ),
    [availabilityMap, selectedItems],
  )

  const totalPrice = useMemo(() => calculateTotal(availableSelectedItems), [availableSelectedItems])

  const handleSubmit = async () => {
    const nextErrors = validateOrder(
      {
        customerName,
        phone,
        address,
        notes,
        serviceType,
      },
      availableSelectedItems,
    )

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitError('')
    setIsSubmitting(true)

    try {
      const order = await submitRemoteOrder({
        customerName,
        phone,
        address,
        pickupTime: '',
        notes,
        serviceType,
        selectedItems: availableSelectedItems,
      })

      completeSubmittedOrder(order)
      navigate('/success')
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : isArabic
            ? 'تعذر إرسال الطلب الآن. حاول مرة أخرى بعد قليل.'
            : 'Unable to send the order right now. Please try again shortly.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8 grid gap-6 overflow-hidden rounded-[40px] border border-white/10 bg-white/5 p-6 shadow-[0_32px_120px_rgba(7,10,13,0.28)] lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
        <div className="flex flex-col justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-gold/80">
              {isArabic ? 'صندوق الطلبات' : 'Order desk'}
            </p>
            <h1 className="mt-3 font-display text-5xl leading-tight text-brand-sand">
              {isArabic ? 'اختيار سريع للأصناف وإرسال الطلب مباشرة' : 'Fast item selection and direct order submission'}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-brand-sand/70">{siteContent.orderDescription[locale]}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-brand-sand transition hover:border-brand-clay/40 hover:bg-brand-clay/10"
            >
              {isArabic ? 'العودة إلى الموقع التعريفي' : 'Back to showcase site'}
              <ArrowLeft className={`h-4 w-4 ${isArabic ? '' : 'rotate-180'}`} />
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-brand-clay/20">
          <img src={orderImageUrl} alt={siteContent.brand[locale]} className="h-full min-h-[320px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/20 to-transparent" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <OrderBuilder
          activeCategory={activeCategory}
          locale={locale}
          selectedItems={availableSelectedItems}
          availabilityMap={availabilityMap}
          onSelectCategory={setActiveCategory}
          onUpdateQuantity={setQuantity}
        />

        <div className="grid gap-6 xl:sticky xl:top-28 xl:self-start">
          <OrderSummaryCard
            locale={locale}
            selectedItems={availableSelectedItems}
            serviceType={serviceType}
            totalPrice={totalPrice}
            errors={errors}
          />
          <OrderFormCard
            locale={locale}
            serviceType={serviceType}
            customerName={customerName}
            phone={phone}
            address={address}
            notes={notes}
            errors={errors}
            submitError={submitError}
            isSubmitting={isSubmitting}
            onFieldChange={updateField}
            onServiceTypeChange={setServiceType}
            onSubmit={handleSubmit}
          />
        </div>
      </section>
    </div>
  )
}
