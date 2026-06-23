import { getStore } from '@netlify/blobs'

import { menuItems, type ServiceType } from '../../src/data/shop'

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled'

export type StoredOrder = {
  id: string
  createdAt: string
  customerName: string
  phone: string
  address: string
  pickupTime: string
  notes: string
  serviceType: ServiceType
  selectedItems: Record<string, number>
  totalPrice: number
  status: OrderStatus
}

export type IncomingOrderPayload = {
  customerName: string
  phone: string
  address: string
  pickupTime: string
  notes: string
  serviceType: ServiceType
  selectedItems: Record<string, number>
}

const menuItemMap = new Map(menuItems.map((item) => [item.id, item]))

function getOrderStore() {
  return getStore('falafel-orders')
}

export const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
}

export function buildResponse(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: jsonHeaders,
    body: JSON.stringify(body),
  }
}

export function handleOptionsRequest() {
  return {
    statusCode: 204,
    headers: jsonHeaders,
    body: '',
  }
}

export function requireAdminKey(providedKey?: string | null) {
  const configuredKey = process.env.ADMIN_ACCESS_KEY?.trim()

  if (!configuredKey) {
    return true
  }

  return providedKey?.trim() === configuredKey
}

export function calculateTotal(selectedItems: Record<string, number>) {
  return Object.entries(selectedItems).reduce((total, [itemId, quantity]) => {
    const item = menuItemMap.get(itemId)
    if (!item || quantity <= 0) {
      return total
    }

    return total + item.price * quantity
  }, 0)
}

export function normalizeSelectedItems(selectedItems: Record<string, number>) {
  return Object.fromEntries(
    Object.entries(selectedItems).filter(([itemId, quantity]) => menuItemMap.has(itemId) && Number(quantity) > 0),
  )
}

export function validateIncomingOrder(payload: Partial<IncomingOrderPayload>) {
  const selectedItems = normalizeSelectedItems(payload.selectedItems ?? {})

  if (payload.serviceType !== 'pickup' && payload.serviceType !== 'delivery') {
    return 'نوع الخدمة غير صحيح'
  }

  if (!payload.customerName?.trim()) {
    return 'الاسم مطلوب'
  }

  if (!payload.phone?.trim()) {
    return 'رقم الجوال مطلوب'
  }

  if (!payload.pickupTime?.trim()) {
    return 'وقت الطلب مطلوب'
  }

  if (payload.serviceType === 'delivery' && !payload.address?.trim()) {
    return 'العنوان مطلوب عند اختيار التوصيل'
  }

  if (Object.keys(selectedItems).length === 0) {
    return 'اختر صنفا واحدا على الأقل'
  }

  return null
}

export function createOrder(payload: IncomingOrderPayload): StoredOrder {
  const selectedItems = normalizeSelectedItems(payload.selectedItems)

  return {
    id: `LZT-${Math.floor(Math.random() * 9000 + 1000)}`,
    createdAt: new Date().toISOString(),
    customerName: payload.customerName.trim(),
    phone: payload.phone.trim(),
    address: payload.address.trim(),
    pickupTime: payload.pickupTime.trim(),
    notes: payload.notes.trim(),
    serviceType: payload.serviceType,
    selectedItems,
    totalPrice: calculateTotal(selectedItems),
    status: 'new',
  }
}

export async function saveOrder(order: StoredOrder) {
  const orderStore = getOrderStore()
  await orderStore.setJSON(`order:${order.id}`, order)
  return order
}

export async function listOrders() {
  const orderStore = getOrderStore()
  const { blobs } = await orderStore.list({ prefix: 'order:' })
  const orders = await Promise.all(
    blobs.map(async (blob) => orderStore.get(blob.key, { type: 'json' as const }) as Promise<StoredOrder | null>),
  )

  return orders
    .filter((order): order is StoredOrder => Boolean(order))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getOrder(orderId: string) {
  const orderStore = getOrderStore()
  return (await orderStore.get(`order:${orderId}`, { type: 'json' })) as StoredOrder | null
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const order = await getOrder(orderId)

  if (!order) {
    return null
  }

  const updatedOrder: StoredOrder = {
    ...order,
    status,
  }

  await saveOrder(updatedOrder)
  return updatedOrder
}
