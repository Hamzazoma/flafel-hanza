import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CarFront,
  Clock3,
  Leaf,
  MapPinned,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react'

import FeatureCard from '@/components/FeatureCard'
import MenuCategoryTabs from '@/components/MenuCategoryTabs'
import MenuItemCard from '@/components/MenuItemCard'
import {
  atmosphereHighlights,
  audienceHighlights,
  heroImageUrl,
  menuItems,
  serviceOptions,
  siteContent,
  stats,
  type MenuCategory,
  defaultMenuAvailabilityMap,
} from '@/data/shop'
import { fetchMenuAvailability, type MenuAvailabilityMap } from '@/lib/orderApi'
import { useShopStore } from '@/store/useShopStore'

const categoryIntro = {
  ar: 'أسعار واضحة وسعرات ظاهرة لكل قسم، مع إبراز الأصناف الأكثر طلبا.',
  en: 'Clear prices, visible calories, and highlighted best sellers in every section.',
}

export default function Home() {
  const locale = useShopStore((state) => state.locale)
  const isArabic = locale === 'ar'
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('sandwiches')
  const [availabilityMap, setAvailabilityMap] = useState<MenuAvailabilityMap>(defaultMenuAvailabilityMap)

  const filteredItems = useMemo(
    () => menuItems.filter((item) => item.category === activeCategory),
    [activeCategory],
  )

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

  return (
    <div className="pb-16">
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-[30px] border border-brand-gold/20 bg-gradient-to-l from-brand-gold/14 via-brand-clay/8 to-transparent px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-gold/80">
              {isArabic ? 'ابدأ بسرعة' : 'Quick start'}
            </p>
            <p className="mt-2 text-sm text-brand-sand/75">
              {isArabic
                ? 'زر الطلب السريع الآن ظاهر أعلى الصفحة لتصل مباشرة إلى موقع الطلبات.'
                : 'The quick order button is now pinned at the top so customers can reach the order flow immediately.'}
            </p>
          </div>
          <Link
            to="/orders"
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-brand-gold px-6 py-3 text-sm font-bold text-brand-ink transition hover:bg-brand-gold-soft sm:self-auto"
          >
            {isArabic ? 'اطلب الآن' : 'Order now'}
            <ArrowLeft className={`h-4 w-4 ${isArabic ? '' : 'rotate-180'}`} />
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-12">
        <div className="overflow-hidden rounded-[40px] border border-white/10 bg-white/5 p-8 shadow-[0_32px_120px_rgba(7,10,13,0.3)] sm:p-10">
          <div className="mb-6 flex flex-wrap gap-3">
            {serviceOptions.map((option) => (
              <span
                key={option.en}
                className="rounded-full border border-brand-gold/20 bg-brand-gold/10 px-4 py-2 text-sm font-medium text-brand-gold"
              >
                {option[locale]}
              </span>
            ))}
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-gold/80">
            {isArabic ? 'موقع المحل' : 'Shop showcase'}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-tight text-brand-sand sm:text-6xl">
            {siteContent.heroTitle[locale]}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-brand-sand/72 sm:text-lg">
            {siteContent.heroDescription[locale]}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-6 py-3 text-sm font-bold text-brand-ink transition hover:bg-brand-gold-soft"
            >
              {isArabic ? 'اطلب الآن' : 'Order now'}
              <ArrowLeft className={`h-4 w-4 ${isArabic ? '' : 'rotate-180'}`} />
            </Link>
            <a
              href="#menu"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-brand-sand transition hover:border-brand-clay/40 hover:bg-brand-clay/10"
            >
              {isArabic ? 'استعرض المنيو' : 'Browse the menu'}
            </a>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <article key={stat.value + stat.label.en} className="rounded-[28px] border border-white/10 bg-black/20 p-4">
                <p className="text-3xl font-bold text-brand-gold">{stat.value}</p>
                <p className="mt-2 text-sm text-brand-sand/65">{stat.label[locale]}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[40px] border border-brand-clay/20">
          <img src={heroImageUrl} alt={siteContent.brand[locale]} className="h-full min-h-[540px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <div className="rounded-[28px] border border-white/10 bg-brand-ink/80 p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold/80">
                {isArabic ? 'هوية محلية واضحة' : 'A local identity'}
              </p>
              <h2 className="mt-3 text-2xl font-bold text-brand-sand">
                {isArabic ? 'لمسة عربية شعبية حديثة تخدم الزبون بسرعة' : 'A modern folk-inspired look built for fast decisions'}
              </h2>
              <p className="mt-3 text-sm leading-7 text-brand-sand/70">
                {isArabic
                  ? 'ألوان دافئة، زخارف بسيطة، وعناصر معلوماتية تساعد الزائر على الوصول للطلب بدون تشتيت.'
                  : 'Warm colors, subtle patterns, and structured content guide visitors from discovery to order without noise.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <FeatureCard title={audienceHighlights[0][locale]} icon={<ShieldCheck className="h-5 w-5" />} />
          <FeatureCard title={audienceHighlights[4][locale]} icon={<Leaf className="h-5 w-5" />} />
          <FeatureCard title={audienceHighlights[5][locale]} icon={<UsersRound className="h-5 w-5" />} />
          <FeatureCard title={atmosphereHighlights[3][locale]} icon={<CarFront className="h-5 w-5" />} />
        </div>
      </section>

      <section id="menu" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-gold/80">
              {isArabic ? 'المنيو' : 'The menu'}
            </p>
            <h2 className="mt-3 text-4xl font-display text-brand-sand">
              {isArabic ? 'كل الأقسام في واجهة واحدة' : 'Every section in one easy-to-scan menu'}
            </h2>
            <p className="mt-3 text-base leading-7 text-brand-sand/65">{categoryIntro[locale]}</p>
          </div>
          <MenuCategoryTabs activeCategory={activeCategory} locale={locale} onSelect={setActiveCategory} />
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} locale={locale} isAvailable={availabilityMap[item.id] !== false} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-[36px] border border-white/10 bg-white/5 p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-gold/80">
              {isArabic ? 'ليش المحل مناسب للطلاب؟' : 'Why students like it'}
            </p>
            <h2 className="mt-3 text-3xl font-display text-brand-sand">
              {isArabic ? 'خدمات سريعة ومناسبة للفطور والعشاء' : 'Fast service for breakfast and dinner'}
            </h2>
            <div className="mt-6 grid gap-4">
              {audienceHighlights.map((item) => (
                <div key={item.en} className="rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-sm text-brand-sand/75">
                  {item[locale]}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[36px] border border-brand-clay/20 bg-brand-clay/10 p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-clay">
              {isArabic ? 'معلومات الزيارة' : 'Visit details'}
            </p>
            <h2 className="mt-3 text-3xl font-display text-brand-sand">
              {isArabic ? 'جو هادئ، انتظار معروف، وربط مباشر بالطلب' : 'A calm vibe, expected wait, and a direct path to ordering'}
            </h2>
            <div className="mt-6 grid gap-4">
              <FeatureCard
                title={atmosphereHighlights[0][locale]}
                description={isArabic ? 'طابع مناسب للجلسات السريعة والأكل الفردي.' : 'A good fit for quick sit-down meals and solo diners.'}
                icon={<Sparkles className="h-5 w-5" />}
              />
              <FeatureCard
                title={atmosphereHighlights[1][locale]}
                description={isArabic ? 'الموقع الرقمي يقلل التردد ويجهز الطلب أسرع.' : 'The digital flow reduces hesitation and speeds up readiness.'}
                icon={<Clock3 className="h-5 w-5" />}
              />
              <FeatureCard
                title={atmosphereHighlights[2][locale]}
                description={isArabic ? 'تظهر المعلومة بوضوح ضمن المحتوى والخدمات.' : 'Reservation availability is highlighted as a service note.'}
                icon={<MapPinned className="h-5 w-5" />}
              />
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[40px] border border-brand-gold/20 bg-gradient-to-br from-brand-gold/18 via-brand-clay/10 to-transparent p-8 sm:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-gold/80">
                {isArabic ? 'الواجهة الثانية' : 'Second experience'}
              </p>
              <h2 className="mt-3 text-3xl font-display text-brand-sand">
                {isArabic ? 'صندوق طلبات مستقل للمحل نفسه' : 'A dedicated ordering site for the same shop'}
              </h2>
              <p className="mt-3 text-base leading-7 text-brand-sand/70">
                {isArabic
                  ? 'الموقع الثاني يركز على اختيار الأصناف والكميات ووقت الاستلام أو التوصيل، ثم يعيدك إلى تجربة المحل بسهولة.'
                  : 'The second site focuses on item selection, quantity control, and pickup or delivery timing, then loops customers back into the brand.'}
              </p>
            </div>
            <Link
              to="/orders"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold px-6 py-3 text-sm font-bold text-brand-ink transition hover:bg-brand-gold-soft"
            >
              {isArabic ? 'افتح موقع الطلبات' : 'Open the order site'}
              <ArrowLeft className={`h-4 w-4 ${isArabic ? '' : 'rotate-180'}`} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
