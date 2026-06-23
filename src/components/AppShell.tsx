import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Globe, ShoppingBag } from 'lucide-react'

import { siteContent } from '@/data/shop'
import { cn } from '@/lib/utils'
import { useShopStore } from '@/store/useShopStore'

const navCopy = {
  ar: {
    home: 'الموقع التعريفي',
    orders: 'صندوق الطلبات',
    switchLabel: 'English',
    footer: 'موقعان مترابطان يخدمان نفس المحل: عرض المنيو ثم استقبال الطلب.',
  },
  en: {
    home: 'Showcase Site',
    orders: 'Order Desk',
    switchLabel: 'العربية',
    footer: 'Two connected experiences for the same falafel shop: explore the menu, then place an order.',
  },
}

export default function AppShell() {
  const locale = useShopStore((state) => state.locale)
  const toggleLocale = useShopStore((state) => state.toggleLocale)
  const isArabic = locale === 'ar'
  const copy = navCopy[locale]

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr'
    document.body.dir = isArabic ? 'rtl' : 'ltr'
  }, [isArabic, locale])

  return (
    <div className="min-h-screen bg-brand-ink text-brand-sand">
      <div className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-brand-ink/85 backdrop-blur">
        <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="font-display text-2xl text-brand-gold">{siteContent.brand[locale]}</p>
            <p className="text-sm text-brand-sand/70">{siteContent.tagline[locale]}</p>
          </div>

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
              <NavItem href="/" label={copy.home} />
              <NavItem href="/orders" label={copy.orders} />
            </nav>

            <button
              type="button"
              onClick={toggleLocale}
              className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-2 text-sm font-medium text-brand-gold transition hover:border-brand-gold/60 hover:bg-brand-gold/15"
            >
              <Globe className="h-4 w-4" />
              {copy.switchLabel}
            </button>
          </div>
        </header>
      </div>

      <main className="pt-24">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-brand-sand/70 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <p>{copy.footer}</p>
          <NavLink
            to="/orders"
            className="inline-flex items-center gap-2 self-start rounded-full border border-brand-clay/50 bg-brand-clay/10 px-4 py-2 font-medium text-brand-sand transition hover:bg-brand-clay/20"
          >
            <ShoppingBag className="h-4 w-4" />
            {copy.orders}
          </NavLink>
        </div>
      </footer>
    </div>
  )
}

type NavItemProps = {
  href: string
  label: string
}

function NavItem({ href, label }: NavItemProps) {
  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        cn(
          'rounded-full px-4 py-2 text-sm font-medium transition',
          isActive ? 'bg-brand-gold text-brand-ink' : 'text-brand-sand/70 hover:bg-white/10 hover:text-brand-sand',
        )
      }
    >
      {label}
    </NavLink>
  )
}
