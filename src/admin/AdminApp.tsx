import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  CircleAlert,
  KeyRound,
  LayoutDashboard,
  LoaderCircle,
  MapPinned,
  Moon,
  PackageCheck,
  PanelTop,
  PhoneCall,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Store,
  Sun,
  Trash2,
} from 'lucide-react'

import { categoryLabels, defaultMenuAvailabilityMap, menuItems, siteContent, type MenuCategory } from '@/data/shop'
import { useTheme } from '@/hooks/useTheme'
import {
  clearRemoteOrders,
  fetchAdminOrders,
  fetchAdminSettings,
  fetchMenuAvailability,
  readSavedAdminKey,
  saveAdminKey,
  updateAdminSettings,
  updateMenuAvailability,
  updateRemoteOrderStatus,
  type AdminSettings,
  type MenuAvailabilityMap,
} from '@/lib/orderApi'
import { type OrderStatus, type SubmittedOrder } from '@/store/useShopStore'
import { buildOrderLines, formatPrice } from '@/utils/order'

const statusLabels: Record<OrderStatus, string> = {
  new: 'جديد',
  preparing: 'قيد التحضير',
  ready: 'جاهز',
  out_for_delivery: 'خرج للتوصيل',
  completed: 'مكتمل',
  cancelled: 'ملغي',
}

const statusOptions: OrderStatus[] = ['new', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled']
const defaultAdminSettings: AdminSettings = { autoClearEnabled: false, lastClearedAt: null }

type AdminView = 'orders' | 'menu' | 'settings'

function countSelectedItems(selectedItems: Record<string, number>) {
  return Object.values(selectedItems).reduce((total, quantity) => total + quantity, 0)
}

const menuItemNameMap = new Map(menuItems.map((item) => [item.id, item.name.ar]))

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ar', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getNextAutoClearAt(lastClearedAt: string | null) {
  if (!lastClearedAt) {
    return null
  }

  const lastDate = new Date(lastClearedAt)
  if (Number.isNaN(lastDate.getTime())) {
    return null
  }

  return new Date(lastDate.getTime() + 24 * 60 * 60 * 1000)
}

export default function AdminApp() {
  const [orders, setOrders] = useState<SubmittedOrder[]>([])
  const [settings, setSettings] = useState<AdminSettings>(defaultAdminSettings)
  const [availabilityMap, setAvailabilityMap] = useState<MenuAvailabilityMap>(defaultMenuAvailabilityMap)
  const [view, setView] = useState<AdminView>('orders')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [apiError, setApiError] = useState('')
  const [accessKey, setAccessKey] = useState('')
  const [draftAccessKey, setDraftAccessKey] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null)
  const [isClearingOrders, setIsClearingOrders] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    document.documentElement.lang = 'ar'
    document.documentElement.dir = 'rtl'
    document.body.dir = 'rtl'
    document.title = `لوحة إدارة ${siteContent.brand.ar}`
    const savedKey = readSavedAdminKey()
    setAccessKey(savedKey)
    setDraftAccessKey(savedKey)
  }, [])

  const loadDashboard = useCallback(
    async (silent = false) => {
      if (!silent) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }

      try {
        const [nextOrders, nextSettings, nextAvailability] = await Promise.all([
          fetchAdminOrders(accessKey),
          fetchAdminSettings(accessKey),
          fetchMenuAvailability(),
        ])

        setOrders(nextOrders)
        setSettings(nextSettings)
        setAvailabilityMap(nextAvailability)
        setApiError('')
      } catch (error) {
        setApiError(error instanceof Error ? error.message : 'تعذر تحميل بيانات لوحة الإدارة')
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [accessKey],
  )

  useEffect(() => {
    loadDashboard()
    const intervalId = window.setInterval(() => loadDashboard(true), 10000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [loadDashboard])

  const summaryCards = useMemo(() => {
    const activeOrders = orders.filter((order) => !['completed', 'cancelled'].includes(order.status))
    const totalRevenue = orders
      .filter((order) => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.totalPrice, 0)
    const unavailableCount = menuItems.filter((item) => availabilityMap[item.id] === false).length

    return [
      {
        label: 'إجمالي الطلبات',
        value: orders.length.toString(),
        hint: 'كل الطلبات المحفوظة حاليًا.',
        icon: ShoppingBag,
      },
      {
        label: 'طلبات نشطة',
        value: activeOrders.length.toString(),
        hint: 'تحتاج تحديث أو متابعة.',
        icon: PanelTop,
      },
      {
        label: 'إيراد مسجل',
        value: formatPrice(totalRevenue, 'ar'),
        hint: 'من الطلبات غير الملغاة.',
        icon: PackageCheck,
      },
      {
        label: 'أصناف غير متوفرة',
        value: unavailableCount.toString(),
        hint: 'لن تظهر قابلة للطلب لدى العميل.',
        icon: Store,
      },
    ]
  }, [availabilityMap, orders])

  const menuCategories = useMemo(() => {
    return (Object.keys(categoryLabels) as MenuCategory[]).map((category) => ({
      category,
      items: menuItems.filter((item) => item.category === category),
    }))
  }, [])

  const nextAutoClearAt = getNextAutoClearAt(settings.lastClearedAt)

  const handleRefresh = async () => {
    await loadDashboard(true)
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

  const handleToggleAvailability = async (itemId: string) => {
    const previousAvailability = availabilityMap
    const nextAvailability = {
      ...previousAvailability,
      [itemId]: previousAvailability[itemId] === false,
    }

    setTogglingItemId(itemId)
    setAvailabilityMap(nextAvailability)

    try {
      const savedAvailability = await updateMenuAvailability(nextAvailability, accessKey)
      setAvailabilityMap(savedAvailability)
      setApiError('')
    } catch (error) {
      setAvailabilityMap(previousAvailability)
      setApiError(error instanceof Error ? error.message : 'تعذر تحديث حالة الصنف')
    } finally {
      setTogglingItemId(null)
    }
  }

  const handleToggleAutoClear = async () => {
    setIsSavingSettings(true)

    try {
      const nextSettings = await updateAdminSettings(!settings.autoClearEnabled, accessKey)
      setSettings(nextSettings)
      setApiError('')
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'تعذر تحديث إعداد الحذف التلقائي')
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleClearAllOrders = async () => {
    const confirmed = window.confirm('هل تريد فعلًا حذف كل الطلبات الحالية الآن؟')
    if (!confirmed) {
      return
    }

    setIsClearingOrders(true)

    try {
      const result = await clearRemoteOrders(accessKey)
      setOrders([])
      setSettings((currentSettings) => ({
        ...currentSettings,
        lastClearedAt: result.clearedAt,
      }))
      setApiError('')
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'تعذر حذف كل الطلبات')
    } finally {
      setIsClearingOrders(false)
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
                لوحة الإدارة
              </div>
              <h1 className="mt-5 font-display text-5xl leading-tight text-brand-sand sm:text-6xl">
                إدارة {siteContent.brand.ar}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-brand-sand/72 sm:text-lg">
                تحكم في الطلبات، وفّر أو أخفِ الأصناف من المنيو، وامسح الطلبات يدويًا أو تلقائيًا كل 24 ساعة.
              </p>
            </div>

            <div className="grid gap-3 rounded-[32px] border border-white/10 bg-black/20 p-5 text-sm text-brand-sand/75 sm:min-w-[340px]">
              <div className="flex items-center gap-2 text-brand-gold">
                <KeyRound className="h-4 w-4" />
                رمز الإدارة
              </div>
              <input
                type="password"
                value={draftAccessKey}
                onChange={(event) => setDraftAccessKey(event.target.value)}
                placeholder="أدخل ADMIN_ACCESS_KEY إذا كان مفعّلًا"
                className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-brand-sand outline-none placeholder:text-brand-sand/35 focus:border-brand-gold/40"
              />
              <div className="flex flex-wrap gap-3">
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
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-brand-sand transition hover:border-brand-gold/30 hover:bg-brand-gold/10"
                >
                  {isDark ? <Sun className="h-4 w-4 text-brand-gold" /> : <Moon className="h-4 w-4 text-brand-gold" />}
                  {isDark ? 'لايت مود' : 'دارك مود'}
                </button>
              </div>
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

        <section className="rounded-[36px] border border-white/10 bg-white/5 p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <SectionTitle
              eyebrow="الأقسام"
              title="تحكم أسرع من شاشة واحدة"
              description="نقلت إدارة المنيو والإعدادات إلى تبويبات واضحة بدل البلوكات الوسطى القديمة."
            />

            <div className="flex flex-wrap gap-3">
              <ViewButton active={view === 'orders'} onClick={() => setView('orders')} label="الطلبات" />
              <ViewButton active={view === 'menu'} onClick={() => setView('menu')} label="المنيو" />
              <ViewButton active={view === 'settings'} onClick={() => setView('settings')} label="الإعدادات" />
            </div>
          </div>

          {apiError ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-gold/25 bg-brand-gold/10 px-4 py-2 text-sm text-brand-sand">
              <CircleAlert className="h-4 w-4" />
              {apiError}
            </div>
          ) : null}

          {isLoading ? (
            <div className="mt-6 inline-flex items-center gap-3 rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-sm text-brand-sand/75">
              <LoaderCircle className="h-4 w-4 animate-spin text-brand-gold" />
              جارٍ تحميل لوحة الإدارة...
            </div>
          ) : null}

          {!isLoading && view === 'orders' ? (
            <div className="mt-6">
              <SectionTitle
                eyebrow="الطلبات"
                title="قائمة الطلبات المباشرة"
                description="تُحدَّث تلقائيًا كل 10 ثوانٍ، ويمكنك تعديل الحالة من نفس البطاقة."
              />

              {orders.length === 0 ? (
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
                        <InfoRow icon={<PackageCheck className="h-4 w-4" />} label="عدد الأصناف" value={countSelectedItems(order.selectedItems).toString()} />
                        <InfoRow icon={<ShoppingBag className="h-4 w-4" />} label="الإجمالي" value={formatPrice(order.totalPrice, 'ar')} />
                      </div>

                      <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-sm text-brand-sand/70">
                        <p>عدد القطع: {countSelectedItems(order.selectedItems)}</p>
                        <p className="mt-2">العنوان: {order.address || 'لا يوجد عنوان لأن الطلب استلام من المحل'}</p>
                        <p className="mt-2">الملاحظات: {order.notes || 'لا توجد ملاحظات'}</p>
                        <div className="mt-4">
                          <p className="font-semibold text-brand-sand">تفاصيل الطلب:</p>
                          <div className="mt-3 grid gap-2">
                            {buildOrderLines(order.selectedItems).map((line) => (
                              <div
                                key={`${order.id}-${line.itemId}`}
                                className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-black/20 px-4 py-3"
                              >
                                <span>{menuItemNameMap.get(line.itemId) ?? line.itemId}</span>
                                <span className="font-semibold">x{line.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {!isLoading && view === 'menu' ? (
            <div className="mt-6">
              <SectionTitle
                eyebrow="المنيو"
                title="التحكم في توفر الأصناف"
                description="عند إيقاف أي صنف سيظهر لدى العميل على أنه غير متوفر ولن يمكن طلبه."
              />

              <div className="mt-6 grid gap-6">
                {menuCategories.map(({ category, items }) => (
                  <article key={category} className="rounded-[28px] border border-white/10 bg-black/20 p-6">
                    <h3 className="text-xl font-semibold text-brand-sand">{categoryLabels[category].ar}</h3>
                    <div className="mt-4 grid gap-3">
                      {items.map((item) => {
                        const isAvailable = availabilityMap[item.id] !== false
                        const isBusy = togglingItemId === item.id

                        return (
                          <div
                            key={item.id}
                            className="flex flex-col gap-4 rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="font-semibold text-brand-sand">{item.name.ar}</p>
                              <p className="mt-1 text-sm text-brand-sand/60">{formatPrice(item.price, 'ar')}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleAvailability(item.id)}
                              disabled={isBusy}
                              className={`rounded-full px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                isAvailable
                                  ? 'bg-brand-gold text-brand-ink hover:bg-brand-gold-soft'
                                  : 'border border-white/15 bg-white/5 text-brand-sand hover:border-brand-gold/30 hover:bg-brand-gold/10'
                              }`}
                            >
                              {isBusy ? 'جارٍ الحفظ...' : isAvailable ? 'متوفر' : 'غير متوفر'}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {!isLoading && view === 'settings' ? (
            <div className="mt-6">
              <SectionTitle
                eyebrow="الإعدادات"
                title="تنظيف الطلبات وإدارة الحذف التلقائي"
                description="يمكنك حذف كل الطلبات الآن، أو تشغيل ميزة تنظيفها كل 24 ساعة، مع تنفيذ دوري عبر Netlify عند التفعيل."
              />

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <article className="rounded-[28px] border border-white/10 bg-black/20 p-6">
                  <div className="flex items-center gap-3 text-brand-gold">
                    <ShieldCheck className="h-5 w-5" />
                    <h3 className="text-lg font-semibold text-brand-sand">الحذف التلقائي</h3>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-brand-sand/70">
                    الحالة الحالية: {settings.autoClearEnabled ? 'مفعّل' : 'متوقف'}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-brand-sand/60">
                    آخر مسح: {settings.lastClearedAt ? formatDateTime(settings.lastClearedAt) : 'لم يتم بعد'}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-brand-sand/60">
                    المسح القادم: {settings.autoClearEnabled && nextAutoClearAt ? formatDateTime(nextAutoClearAt.toISOString()) : 'غير محدد'}
                  </p>
                  <button
                    type="button"
                    onClick={handleToggleAutoClear}
                    disabled={isSavingSettings}
                    className={`mt-5 rounded-full px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      settings.autoClearEnabled
                        ? 'border border-white/15 bg-white/5 text-brand-sand hover:border-brand-gold/30 hover:bg-brand-gold/10'
                        : 'bg-brand-gold text-brand-ink hover:bg-brand-gold-soft'
                    }`}
                  >
                    {isSavingSettings ? 'جارٍ الحفظ...' : settings.autoClearEnabled ? 'إيقاف الحذف التلقائي' : 'تشغيل الحذف التلقائي'}
                  </button>
                </article>

                <article className="rounded-[28px] border border-white/10 bg-black/20 p-6">
                  <div className="flex items-center gap-3 text-brand-gold">
                    <Trash2 className="h-5 w-5" />
                    <h3 className="text-lg font-semibold text-brand-sand">مسح كل الطلبات</h3>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-brand-sand/70">
                    هذا الزر يحذف كل الطلبات الحالية فورًا من لوحة الإدارة ومن موقع العميل.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearAllOrders}
                    disabled={isClearingOrders}
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-brand-sand transition hover:border-brand-gold/30 hover:bg-brand-gold/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isClearingOrders ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    {isClearingOrders ? 'جارٍ المسح...' : 'امسح كل الطلبات الآن'}
                  </button>
                </article>
              </div>
            </div>
          ) : null}
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

type ViewButtonProps = {
  active: boolean
  label: string
  onClick: () => void
}

function ViewButton({ active, label, onClick }: ViewButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-brand-gold text-brand-ink'
          : 'border border-white/10 bg-white/5 text-brand-sand hover:border-brand-gold/30 hover:bg-brand-gold/10'
      }`}
    >
      {label}
    </button>
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
