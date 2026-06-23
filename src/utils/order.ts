import { menuItems, type Locale, type ServiceType } from '@/data/shop'

export type SelectedItems = Record<string, number>

export type OrderFormState = {
  customerName: string
  phone: string
  address: string
  pickupTime: string
  notes: string
  serviceType: ServiceType
}

export type OrderValidationErrors = Partial<Record<keyof OrderFormState | 'items', string>>

const menuItemMap = new Map(menuItems.map((item) => [item.id, item]))

export function formatPrice(price: number, locale: Locale) {
  return locale === 'ar' ? `${price} ريال` : `SAR ${price}`
}

export function formatCalories(calories: number | undefined, locale: Locale) {
  if (!calories) {
    return locale === 'ar' ? 'بدون سعرات محددة' : 'Calories not listed'
  }

  return locale === 'ar' ? `${calories} سعرة` : `${calories} kcal`
}

export function getDefaultPickupTime() {
  const value = new Date(Date.now() + 30 * 60 * 1000)
  value.setSeconds(0, 0)
  return value.toISOString().slice(0, 16)
}

export function getItemQuantity(selectedItems: SelectedItems, itemId: string) {
  return selectedItems[itemId] ?? 0
}

export function calculateItemCount(selectedItems: SelectedItems) {
  return Object.values(selectedItems).reduce((total, count) => total + count, 0)
}

export function calculateTotal(selectedItems: SelectedItems) {
  return Object.entries(selectedItems).reduce((total, [itemId, quantity]) => {
    const item = menuItemMap.get(itemId)
    if (!item) {
      return total
    }

    return total + item.price * quantity
  }, 0)
}

export function buildOrderLines(selectedItems: SelectedItems) {
  return Object.entries(selectedItems)
    .filter(([, quantity]) => quantity > 0)
    .map(([itemId, quantity]) => {
      const item = menuItemMap.get(itemId)

      return {
        itemId,
        quantity,
        item,
      }
    })
    .filter((line) => line.item)
}

export function validateOrder(form: OrderFormState, selectedItems: SelectedItems): OrderValidationErrors {
  const errors: OrderValidationErrors = {}

  if (calculateItemCount(selectedItems) === 0) {
    errors.items = 'اختر صنفا واحدا على الأقل'
  }

  if (!form.customerName.trim()) {
    errors.customerName = 'الاسم مطلوب'
  }

  if (!form.phone.trim()) {
    errors.phone = 'رقم الجوال مطلوب'
  }

  if (!form.pickupTime.trim()) {
    errors.pickupTime = form.serviceType === 'delivery' ? 'وقت التوصيل مطلوب' : 'وقت الاستلام مطلوب'
  }

  if (form.serviceType === 'delivery' && !form.address.trim()) {
    errors.address = 'العنوان مطلوب عند اختيار التوصيل'
  }

  return errors
}
