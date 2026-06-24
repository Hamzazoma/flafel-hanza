import type { ServiceType } from '@/data/shop'
import type { OrderStatus, SubmittedOrder } from '@/store/useShopStore'

export type SubmitOrderPayload = {
  customerName: string
  phone: string
  address: string
  pickupTime: string
  notes: string
  serviceType: ServiceType
  selectedItems: Record<string, number>
}

const ADMIN_KEY_STORAGE = 'falafel-admin-access-key'

function getApiBaseUrl() {
  const rawValue = import.meta.env.VITE_API_BASE_URL?.trim()
  if (!rawValue) {
    return ''
  }

  const cleanedValue = rawValue.replace(/^[`'"]+|[`'"]+$/g, '').trim()
  if (!cleanedValue) {
    return ''
  }

  const normalizedValue = /^https?:\/\//i.test(cleanedValue) ? cleanedValue : `https://${cleanedValue}`

  try {
    return new URL(normalizedValue).toString().replace(/\/$/, '')
  } catch {
    return normalizedValue.replace(/\/$/, '')
  }
}

function buildApiUrl(path: string) {
  return `${getApiBaseUrl()}${path}`
}

async function performApiRequest(input: string, init?: RequestInit) {
  try {
    return await fetch(input, init)
  } catch {
    throw new Error('تعذر الوصول إلى API. تأكد من رابط VITE_API_BASE_URL وإعادة نشر الموقعين.')
  }
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(typeof data?.error === 'string' ? data.error : 'حدث خطأ أثناء الاتصال بالخادم')
  }

  return data as T
}

export async function submitRemoteOrder(payload: SubmitOrderPayload) {
  const response = await performApiRequest(buildApiUrl('/.netlify/functions/orders-submit'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await parseJsonResponse<{ order: SubmittedOrder }>(response)
  return data.order
}

export async function fetchAdminOrders(adminKey?: string) {
  const response = await performApiRequest(buildApiUrl('/.netlify/functions/orders-list'), {
    headers: adminKey
      ? {
          'x-admin-key': adminKey,
        }
      : undefined,
  })

  const data = await parseJsonResponse<{ orders: SubmittedOrder[] }>(response)
  return data.orders
}

export async function updateRemoteOrderStatus(orderId: string, status: OrderStatus, adminKey?: string) {
  const response = await performApiRequest(buildApiUrl('/.netlify/functions/orders-update'), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(adminKey ? { 'x-admin-key': adminKey } : {}),
    },
    body: JSON.stringify({
      orderId,
      status,
    }),
  })

  const data = await parseJsonResponse<{ order: SubmittedOrder }>(response)
  return data.order
}

export function readSavedAdminKey() {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(ADMIN_KEY_STORAGE) ?? ''
}

export function saveAdminKey(value: string) {
  if (typeof window === 'undefined') {
    return
  }

  if (!value.trim()) {
    window.localStorage.removeItem(ADMIN_KEY_STORAGE)
    return
  }

  window.localStorage.setItem(ADMIN_KEY_STORAGE, value.trim())
}
