import { describe, expect, it } from 'vitest'

import { calculateItemCount, calculateTotal, validateOrder } from '@/utils/order'

describe('order helpers', () => {
  it('calculates total price and item count from selected items', () => {
    const selectedItems = {
      'sand-mix-regular': 2,
      'box-arabi': 1,
      'drink-water-small': 3,
    }

    expect(calculateItemCount(selectedItems)).toBe(6)
    expect(calculateTotal(selectedItems)).toBe(37.5)
  })

  it('validates required fields for delivery orders', () => {
    const errors = validateOrder(
      {
        customerName: '',
        phone: '',
        address: '',
        pickupTime: '',
        notes: '',
        serviceType: 'delivery',
      },
      {},
    )

    expect(errors.items).toBe('اختر صنفا واحدا على الأقل')
    expect(errors.customerName).toBe('الاسم مطلوب')
    expect(errors.phone).toBe('رقم الجوال مطلوب')
    expect(errors.address).toBe('العنوان مطلوب عند اختيار التوصيل')
    expect(errors.pickupTime).toBe('وقت التوصيل مطلوب')
  })
})
