import type { ReactNode } from 'react'
import { Clock3, MapPinned, Phone, UserRound } from 'lucide-react'

import type { Locale, ServiceType } from '@/data/shop'
import type { OrderValidationErrors } from '@/utils/order'

type OrderFormCardProps = {
  locale: Locale
  serviceType: ServiceType
  customerName: string
  phone: string
  address: string
  pickupTime: string
  notes: string
  errors: OrderValidationErrors
  submitError?: string
  isSubmitting?: boolean
  onFieldChange: (field: 'customerName' | 'phone' | 'address' | 'pickupTime' | 'notes', value: string) => void
  onServiceTypeChange: (value: ServiceType) => void
  onSubmit: () => void
}

const copy = {
  ar: {
    title: 'بيانات الطلب',
    service: 'نوع الخدمة',
    pickup: 'استلام من المحل',
    delivery: 'توصيل',
    name: 'الاسم',
    phone: 'رقم الجوال',
    address: 'العنوان',
    pickupTime: 'وقت الاستلام أو التوصيل',
    notes: 'ملاحظات إضافية',
    notesPlaceholder: 'مثلا: بدون مخلل أو اتصل عند الوصول',
    submit: 'إرسال الطلب',
  },
  en: {
    title: 'Order details',
    service: 'Service type',
    pickup: 'Pickup',
    delivery: 'Delivery',
    name: 'Name',
    phone: 'Phone number',
    address: 'Address',
    pickupTime: 'Pickup or delivery time',
    notes: 'Extra notes',
    notesPlaceholder: 'Example: no pickles or call on arrival',
    submit: 'Send order',
  },
}

export default function OrderFormCard({
  locale,
  serviceType,
  customerName,
  phone,
  address,
  pickupTime,
  notes,
  errors,
  submitError,
  isSubmitting = false,
  onFieldChange,
  onServiceTypeChange,
  onSubmit,
}: OrderFormCardProps) {
  const text = copy[locale]

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(7,10,13,0.24)]">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold/80">
          {locale === 'ar' ? 'الخطوة الثانية' : 'Step two'}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-brand-sand">{text.title}</h2>
      </div>

      <div className="grid gap-4">
        <div>
          <p className="mb-3 text-sm font-semibold text-brand-sand">{text.service}</p>
          <div className="grid grid-cols-2 gap-3">
            <ServiceButton
              active={serviceType === 'pickup'}
              label={text.pickup}
              onClick={() => onServiceTypeChange('pickup')}
            />
            <ServiceButton
              active={serviceType === 'delivery'}
              label={text.delivery}
              onClick={() => onServiceTypeChange('delivery')}
            />
          </div>
        </div>

        <Field
          icon={<UserRound className="h-4 w-4" />}
          label={text.name}
          value={customerName}
          error={errors.customerName}
          onChange={(value) => onFieldChange('customerName', value)}
        />

        <Field
          icon={<Phone className="h-4 w-4" />}
          label={text.phone}
          value={phone}
          error={errors.phone}
          onChange={(value) => onFieldChange('phone', value)}
        />

        {serviceType === 'delivery' ? (
          <Field
            icon={<MapPinned className="h-4 w-4" />}
            label={text.address}
            value={address}
            error={errors.address}
            onChange={(value) => onFieldChange('address', value)}
          />
        ) : null}

        <Field
          icon={<Clock3 className="h-4 w-4" />}
          label={text.pickupTime}
          type="datetime-local"
          value={pickupTime}
          error={errors.pickupTime}
          onChange={(value) => onFieldChange('pickupTime', value)}
        />

        <label className="grid gap-2 text-sm font-semibold text-brand-sand">
          {text.notes}
          <textarea
            value={notes}
            onChange={(event) => onFieldChange('notes', event.target.value)}
            rows={4}
            placeholder={text.notesPlaceholder}
            className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-sm font-normal text-brand-sand outline-none transition placeholder:text-brand-sand/35 focus:border-brand-gold/40"
          />
        </label>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="mt-2 rounded-full bg-brand-gold px-5 py-3 text-sm font-bold text-brand-ink transition hover:bg-brand-gold-soft disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (locale === 'ar' ? 'جارٍ الإرسال...' : 'Sending...') : text.submit}
        </button>

        {submitError ? <p className="text-sm text-brand-clay">{submitError}</p> : null}
      </div>
    </section>
  )
}

type FieldProps = {
  label: string
  value: string
  error?: string
  icon: ReactNode
  type?: string
  onChange: (value: string) => void
}

function Field({ label, value, error, icon, type = 'text', onChange }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-brand-sand">
      {label}
      <div className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 transition focus-within:border-brand-gold/40">
        <span className="text-brand-gold">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-sm font-normal text-brand-sand outline-none placeholder:text-brand-sand/35"
        />
      </div>
      {error ? <span className="text-xs text-brand-clay">{error}</span> : null}
    </label>
  )
}

type ServiceButtonProps = {
  active: boolean
  label: string
  onClick: () => void
}

function ServiceButton({ active, label, onClick }: ServiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-3 text-sm font-semibold transition ${
        active
          ? 'border-brand-gold bg-brand-gold text-brand-ink'
          : 'border-white/10 bg-white/5 text-brand-sand/75 hover:border-brand-gold/30 hover:bg-brand-gold/10'
      }`}
    >
      {label}
    </button>
  )
}
