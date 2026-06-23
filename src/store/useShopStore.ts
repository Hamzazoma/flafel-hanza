import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { type Locale, type ServiceType } from '@/data/shop'
import { getDefaultPickupTime, type SelectedItems } from '@/utils/order'

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled'

export type SubmittedOrder = {
  id: string
  createdAt: string
  customerName: string
  phone: string
  address: string
  pickupTime: string
  notes: string
  serviceType: ServiceType
  selectedItems: SelectedItems
  totalPrice: number
  status: OrderStatus
}

type ShopState = {
  locale: Locale
  selectedItems: SelectedItems
  customerName: string
  phone: string
  address: string
  pickupTime: string
  notes: string
  serviceType: ServiceType
  lastSubmittedOrder: SubmittedOrder | null
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  setQuantity: (itemId: string, quantity: number) => void
  updateField: (field: 'customerName' | 'phone' | 'address' | 'pickupTime' | 'notes', value: string) => void
  setServiceType: (value: ServiceType) => void
  completeSubmittedOrder: (order: SubmittedOrder) => void
  resetOrder: () => void
}

const initialOrderState = {
  selectedItems: {},
  customerName: '',
  phone: '',
  address: '',
  pickupTime: getDefaultPickupTime(),
  notes: '',
  serviceType: 'pickup' as ServiceType,
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      locale: 'ar',
      lastSubmittedOrder: null,
      ...initialOrderState,
      setLocale: (locale) => set({ locale }),
      toggleLocale: () =>
        set((state) => ({
          locale: state.locale === 'ar' ? 'en' : 'ar',
        })),
      setQuantity: (itemId, quantity) =>
        set((state) => {
          const nextItems = { ...state.selectedItems }

          if (quantity <= 0) {
            delete nextItems[itemId]
          } else {
            nextItems[itemId] = quantity
          }

          return { selectedItems: nextItems }
        }),
      updateField: (field, value) =>
        set({
          [field]: value,
        } as Pick<ShopState, typeof field>),
      setServiceType: (serviceType) => set({ serviceType }),
      completeSubmittedOrder: (order) =>
        set({
          lastSubmittedOrder: order,
          ...initialOrderState,
          pickupTime: getDefaultPickupTime(),
        }),
      resetOrder: () =>
        set({
          ...initialOrderState,
          pickupTime: getDefaultPickupTime(),
        }),
    }),
    {
      name: 'lazzat-al-taam-store',
      partialize: (state) => ({ locale: state.locale }),
    },
  ),
)
