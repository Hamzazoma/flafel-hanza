import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  CircleAlert,
  Clock3,
  ExternalLink,
  KeyRound,
  LayoutDashboard,
  LoaderCircle,
  MapPinned,
  PackageCheck,
  PanelTop,
  PhoneCall,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Store,
} from 'lucide-react'

import { menuItems, siteContent } from '@/data/shop'
import { fetchAdminOrders, readSavedAdminKey, saveAdminKey, updateRemoteOrderStatus } from '@/lib/orderApi'
import { type OrderStatus, type SubmittedOrder } from '@/store/useShopStore'
import { formatPrice } from '@/utils/order'

const statusLabels: Record<OrderStatus, string> = {
  new: 'جديد',
  preparing: 'قيد التحضير',
  ready: 'جاهز',
  out_for_delivery: 'خرج للتوصيل',
  completed: 'مكتمل',
  cancelled: 'ملغي',
}

const statusOptions: OrderStatus[] = ['new', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled']

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || 'نفس الدومين الحالي'

function countSelectedItems(selectedItems: Record<string, number>) {
  return Object.values(selectedItems).reduce((total, quantity) => total + quantity, 0)
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ar', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function playNewOrderTone() {
  if (typeof window === 'undefined') {
    return
  }

  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) {
    return
  }

  try {
    const audioContext = new AudioContextClass()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(1174, audioContext.currentTime + 0.12)

    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.35)

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.36)

    window.setTimeout(() => {
      void audioContext.close().catch(() => undefined)
    }, 500)
  } catch {
    // Ignore audio playback failures if the browser blocks autoplay.
  }
}

export default function AdminApp() {
  const [orders, setOrders] = useState<SubmittedOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [apiError, setApiError] = useState('')
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>('')
  const [accessKey, setAccessKey] = useState('')
  const [draftAccessKey, setDraftAccessKey] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const previousOrderCountRef = useRef<number | null>(null)

  useEffect(() => {
    document.documentElement.lang = 'ar'
    document.documentElement.dir = 'rtl'
    document.body.dir = 'rtl'
    document.title = `لوحة إدارة ${siteContent.brand.ar}`
    const savedKey = readSavedAdminKey()
    setAccessKey(savedKey)
    setDraftAccessKey(savedKey)
  }, [])

  useEffect(() => {
    let active = true

    const loadOrders = async (silent = false) => {
      if (!silent) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }

      try {
        const nextOrders = await fetchAdminOrders(accessKey)
        if (!active) {
          return
        }

        const previousOrderCount = previousOrderCountRef.current
        if (previousOrderCount !== null && nextOrders.length > previousOrderCount) {
          playNewOrderTone()
        }

        previousOrderCountRef.current = nextOrders.length
        setOrders(nextOrders)
        setLastUpdatedAt(new Date().toISOString())
        setApiError('')
      } catch (error) {
        if (!active) {
          return
        }

        setApiError(error instanceof Error ? error.message : 'تعذر تحميل الطلبات')
      } finally {
        if (!active) {
          return
        }

        setIsLoading(false)
        setIsRefreshing(false)
      }
    }

    loadOrders()
    const intervalId = isAutoRefreshEnabled ? window.setInterval(() => loadOrders(true), 5000) : null

    return () => {
      active = false
      if (intervalId !== null) {
        window.clearInterval(intervalId)
      }
    }
  }, [accessKey, isAutoRefreshEnabled])

  const summaryCards = useMemo(() => {
    const activeOrders = orders.filter((order) => !['completed', 'cancelled'].includes(order.status))
    const totalRevenue = orders
      .filter((order) => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.totalPrice, 0)

    return [
      {
        label: 'إجمالي الطلبات',
        value: orders.length.toString(),
        hint: 'كل الطلبات القادمة من موقع العملاء.',
        icon: ShoppingBag,
      },
      {
        label: 'طلبات نشطة',
        value: activeOrders.length.toString(),
        hint: 'تحتاج متابعة أو تحديث حالة.',
        icon: PanelTop,
      },
      {
        label: 'إيراد مسجل',
        value: formatPrice(totalRevenue, 'ar'),
        hint: 'محسوب من الطلبات غير الملغاة.',
        icon: PackageCheck,
      },
      {
        label: 'أصناف المنيو',
        value: menuItems.length.toString(),
        hint: 'مأخوذة من بيانات المشروع الحالية.',
        icon: Store,
      },
    ]
  }, [orders])

  const channelCards = useMemo(
    () => [
      {
        title: 'موقع العملاء',
        description: 'يرسل الطلبات إلى Functions على Netlify.',
        value: 'الواجهة الأساسية',
        icon: Store,
      },
      {
        title: 'لوحة الإدارة',
        description: 'تقرأ الطلبات من نفس الـ API ويمكن نشرها على Subdomain منفصل.',
        value: 'admin.yourdomain.com',
        icon: LayoutDashboard,
      },
      {
        title: 'رابط الـ API',
        description: 'إذا كانت لوحة الإدارة منشورة على موقع Netlify مختلف، اربطها بهذا الرابط عبر متغير البيئة.',
        value: apiBaseUrl,
        icon: ExternalLink,
      },
    ],
    [],
  )

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const nextOrders = await fetchAdminOrders(accessKey)
      const previousOrderCount = previousOrderCountRef.current
      if (previousOrderCount !== null && nextOrders.length > previousOrderCount) {
        playNewOrderTone()
      }

      previousOrderCountRef.current = nextOrders.length
      setOrders(nextOrders)
      setLastUpdatedAt(new Date().toISOString())
      setApiError('')
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'تعذر تحديث الطلبات')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSaveKey = () => {
    const nextKey = draftAccessKey.trim()
    saveAdminKey(nextKey)
    setAccessKey(nextKey)
  }

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdatingOrderId(orderId)

    try {
      const updatedOrder = await updateRemoteOrderStatus(orderId, status, accessKey)
      setOrders((currentOrders) => currentOrders.map((order) => (order.id === orderId ? updatedOrder : order)))
      setApiError('')
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'تعذر تحديث حالة الطلب')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  return (
    <div className="min-h-screen bg-brand-ink text-brand-sand">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[40px] border border-white/10 bg-white/5 p-8 shadow-[0_32px_120px_rgba(7,10,13,0.3)] sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/25 bg-brand-gold/10 px-4 py-2 text-sm font-medium text-brand-gold">
                <LayoutDashboard className="h-4 w-4" />
                لوحة إدارة حية على Netlify
              </div>
              <h1 className="mt-5 font-display text-5xl leading-tight text-brand-sand sm:text-6xl">
                إدارة تشغيل {siteContent.brand.ar}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-brand-sand/72 sm:text-lg">
                هذه اللوحة تقرأ الطلبات الحقيقية من
                {' '}
                <span className="font-semibold text-brand-gold">Netlify Functions</span>
                {' '}
                وتسمح بتحديث حالتها من نفس الواجهة.
              </p>
            </div>

            <div className="grid gap-3 rounded-[32px] border border-white/10 bg-black/20 p-5 text-sm text-brand-sand/75 sm:min-w-[320px]">
              <div className="flex items-center gap-2 text-brand-gold">
                <KeyRound className="h-4 w-4" />
                رمز الإدارة
              </div>
              <input
                type="password"
                value={draftAccessKey}
                onChange={(event) => setDraftAccessKey(event.target.value)}
                placeholder="اختياري الآن، ومطلوب إذا فعّلت ADMIN_ACCESS_KEY"
                className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-brand-sand outline-none placeholder:text-brand-sand/35 focus:border-brand-gold/40"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="rounded-full bg-brand-gold px-4 py-2 text-sm font-bold text-brand-ink transition hover:bg-brand-gold-soft"
                >
                  حفظ الرمز
                </button>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-brand-sand transition hover:border-brand-gold/30 hover:bg-brand-gold/10"
                >
                  {isRefreshing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  تحديث
                </button>
                <button
                  type="button"
                  onClick={() => setIsAutoRefreshEnabled((value) => !value)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-brand-sand transition hover:border-brand-gold/30 hover:bg-brand-gold/10"
                >
                  {isAutoRefreshEnabled ? 'إيقاف التحديث التلقائي' : 'تشغيل التحديث التلقائي'}
                </button>
              </div>
              <p>{isAutoRefreshEnabled ? 'التحديث التلقائي يعمل كل 5 ثوانٍ.' : 'التحديث التلقائي متوقف حاليًا.'}</p>
              <p>{lastUpdatedAt ? `آخر تحديث: ${formatDateTime(lastUpdatedAt)}` : 'آخر تحديث: لم يتم التحديث بعد.'}</p>
              <p>إذا نشرت لوحة الإدارة على موقع Netlify مختلف، اضبط `VITE_API_BASE_URL` ليشير إلى موقع العميل الأساسي.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon
            return (
              <article key={card.label} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-brand-sand/70">{card.label}</p>
                  <div className="rounded-full border border-brand-gold/20 bg-brand-gold/10 p-3 text-brand-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-6 text-3xl font-bold text-brand-sand">{card.value}</p>
                <p className="mt-2 text-sm leading-7 text-brand-sand/60">{card.hint}</p>
              </article>
            )
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <article className="rounded-[36px] border border-white/10 bg-white/5 p-8">
            <SectionTitle
              eyebrow="قنوات الربط"
              title="شكل الاتصال بين الموقعين"
              description="يمكنك نشر الواجهتين على موقعين مختلفين في Netlify مع API موحّد."
            />

            <div className="mt-6 grid gap-4">
              {channelCards.map((card) => {
                const Icon = card.icon
                return (
                  <div
                    key={card.title}
                    className="flex flex-col gap-3 rounded-[26px] border border-white/10 bg-black/20 p-5 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="flex gap-4">
                      <div className="rounded-full border border-brand-clay/30 bg-brand-clay/10 p-3 text-brand-clay">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-brand-sand">{card.title}</h3>
                        <p className="mt-1 text-sm leading-7 text-brand-sand/65">{card.description}</p>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-brand-gold">
                      <ExternalLink className="h-4 w-4" />
                      {card.value}
                    </div>
                  </div>
                )
              })}
            </div>
          </article>

          <article className="rounded-[36px] border border-white/10 bg-white/5 p-8">
            <SectionTitle
              eyebrow="الحالة الحالية"
              title="حالة التكامل"
              description="هذه الواجهة أصبحت تقرأ وتحدّث الطلبات من Netlify بدل البيانات التجريبية."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <FeatureNote
                icon={<ShieldCheck className="h-5 w-5" />}
                title="تخزين دائم"
                description="الطلبات تُحفظ في Netlify Blobs بدل localStorage المحلي فقط."
              />
              <FeatureNote
                icon={<PanelTop className="h-5 w-5" />}
                title="API مشترك"
                description="موقع العملاء ولوحة الإدارة يتحدثان مع نفس الـ Functions."
              />
              <FeatureNote
                icon={<PackageCheck className="h-5 w-5" />}
                title="تحديث الحالة"
                description="يمكن تحويل الطلب بين جديد وتحضير وجاهز ومكتمل أو ملغي."
              />
              <FeatureNote
                icon={<Store className="h-5 w-5" />}
                title="جاهز للنشر"
                description="بقي فقط ربط حساب Netlify ونشر الموقع الأساسي ولوحة الإدارة."
              />
            </div>
          </article>
        </section>

        <section className="rounded-[36px] border border-white/10 bg-white/5 p-8">
          <SectionTitle
            eyebrow="الطلبات"
            title="قائمة الطلبات المباشرة"
            description="يمكنك تشغيل التحديث التلقائي كل 5 ثوانٍ أو إيقافه، مع إمكانية التحديث اليدوي في أي وقت."
          />

          {apiError ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-clay/30 bg-brand-clay/10 px-4 py-2 text-sm text-brand-sand">
              <CircleAlert className="h-4 w-4" />
              {apiError}
            </div>
          ) : null}

          {isLoading ? (
            <div className="mt-6 inline-flex items-center gap-3 rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-sm text-brand-sand/75">
              <LoaderCircle className="h-4 w-4 animate-spin text-brand-gold" />
              جارٍ تحميل الطلبات...
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 px-5 py-5 text-sm text-brand-sand/70">
              لا توجد طلبات محفوظة بعد. عند إرسال أول طلب من موقع العملاء سيظهر هنا مباشرة.
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {orders.map((order) => (
                <article key={order.id} className="rounded-[28px] border border-white/10 bg-black/20 p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-semibold text-brand-sand">{order.id}</h3>
                        <span className="rounded-full border border-brand-gold/20 bg-brand-gold/10 px-4 py-2 text-sm text-brand-gold">
                          {statusLabels[order.status]}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-brand-sand/60">{formatDateTime(order.createdAt)}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        value={order.status}
                        onChange={(event) => handleStatusChange(order.id, event.target.value as OrderStatus)}
                        disabled={updatingOrderId === order.id}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-brand-sand outline-none focus:border-brand-gold/40 disabled:opacity-60"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status} className="bg-brand-ink text-brand-sand">
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>

                      {updatingOrderId === order.id ? (
                        <span className="inline-flex items-center gap-2 text-sm text-brand-sand/70">
                          <LoaderCircle className="h-4 w-4 animate-spin text-brand-gold" />
                          جارٍ التحديث...
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-brand-sand/75 md:grid-cols-2 xl:grid-cols-4">
                    <InfoRow icon={<PhoneCall className="h-4 w-4" />} label="العميل" value={`${order.customerName} - ${order.phone}`} />
                    <InfoRow
                      icon={<MapPinned className="h-4 w-4" />}
                      label="نوع الخدمة"
                      value={order.serviceType === 'delivery' ? 'توصيل' : 'استلام من المحل'}
                    />
                    <InfoRow icon={<Clock3 className="h-4 w-4" />} label="وقت الطلب" value={order.pickupTime} />
                    <InfoRow icon={<ShoppingBag className="h-4 w-4" />} label="الإجمالي" value={formatPrice(order.totalPrice, 'ar')} />
                  </div>

                  <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-sm text-brand-sand/70">
                    <p>عدد القطع: {countSelectedItems(order.selectedItems)}</p>
                    <p className="mt-2">العنوان: {order.address || 'لا يوجد عنوان لأن الطلب استلام من المحل'}</p>
                    <p className="mt-2">الملاحظات: {order.notes || 'لا توجد ملاحظات'}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

type SectionTitleProps = {
  eyebrow: string
  title: string
  description: string
}

function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-gold/80">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-display text-brand-sand">{title}</h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-brand-sand/65">{description}</p>
    </div>
  )
}

type InfoRowProps = {
  icon: ReactNode
  label: string
  value: string
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-brand-gold">{icon}</div>
      <div>
        <p className="text-xs text-brand-sand/50">{label}</p>
        <p className="font-medium text-brand-sand">{value}</p>
      </div>
    </div>
  )
}

type FeatureNoteProps = {
  icon: ReactNode
  title: string
  description: string
}

function FeatureNote({ icon, title, description }: FeatureNoteProps) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-full border border-brand-gold/20 bg-brand-gold/10 p-2 text-brand-gold">{icon}</div>
        <h3 className="text-lg font-semibold text-brand-sand">{title}</h3>
      </div>
      <p className="mt-4 text-sm leading-7 text-brand-sand/70">{description}</p>
    </div>
  )
}
