import { connectLambda, getStore } from '@netlify/blobs'
import type { HandlerEvent } from '@netlify/functions'

import { menuItems, type ServiceType } from '../../src/data/shop'

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled'

export type StoredOrder = {
  id: string
  createdAt: string
  customerName: string
  phone: string
  address: string
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
  notes: string
  serviceType: ServiceType
  selectedItems: Record<string, number>
}

export type MenuAvailabilityMap = Record<string, boolean>

export type AdminSettings = {
  autoClearEnabled: boolean
  lastClearedAt: string | null
}

const ORDER_KEY_PREFIX = 'order:'
const MENU_AVAILABILITY_KEY = 'config:menu-availability'
const ADMIN_SETTINGS_KEY = 'config:admin-settings'
const DAY_IN_MS = 24 * 60 * 60 * 1000

const menuItemMap = new Map(menuItems.map((item) => [item.id, item]))

function getOrderStore() {
  return getStore('falafel-orders')
}

export function initializeBlobs(event?: HandlerEvent) {
  if (event) {
    connectLambda(event as any)
  }
}

export const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
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

function getDefaultMenuAvailabilityMap(): MenuAvailabilityMap {
  return Object.fromEntries(menuItems.map((item) => [item.id, true]))
}

function normalizeMenuAvailabilityMap(value: unknown): MenuAvailabilityMap {
  const defaults = getDefaultMenuAvailabilityMap()

  if (!value || typeof value !== 'object') {
    return defaults
  }

  const nextMap = { ...defaults }
  const record = value as Record<string, unknown>

  for (const item of menuItems) {
    if (typeof record[item.id] === 'boolean') {
      nextMap[item.id] = record[item.id] as boolean
    }
  }

  return nextMap
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
    notes: payload.notes.trim(),
    serviceType: payload.serviceType,
    selectedItems,
    totalPrice: calculateTotal(selectedItems),
    status: 'new',
  }
}

export async function saveOrder(order: StoredOrder) {
  const orderStore = getOrderStore()
  await orderStore.setJSON(`${ORDER_KEY_PREFIX}${order.id}`, order)
  return order
}

export async function listOrders() {
  const orderStore = getOrderStore()
  const { blobs } = await orderStore.list({ prefix: ORDER_KEY_PREFIX })
  const orders = await Promise.all(
    blobs.map(async (blob) => orderStore.get(blob.key, { type: 'json' as const }) as Promise<StoredOrder | null>),
  )

  return orders
    .filter((order): order is StoredOrder => Boolean(order))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getOrder(orderId: string) {
  const orderStore = getOrderStore()
  return (await orderStore.get(`${ORDER_KEY_PREFIX}${orderId}`, { type: 'json' as const })) as StoredOrder | null
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

export async function getMenuAvailabilityMap() {
  const orderStore = getOrderStore()
  const value = await orderStore.get(MENU_AVAILABILITY_KEY, { type: 'json' as const })
  return normalizeMenuAvailabilityMap(value)
}

export async function saveMenuAvailabilityMap(nextMap: MenuAvailabilityMap) {
  const orderStore = getOrderStore()
  const normalizedMap = normalizeMenuAvailabilityMap(nextMap)
  await orderStore.setJSON(MENU_AVAILABILITY_KEY, normalizedMap)
  return normalizedMap
}

export function getUnavailableSelectedItemIds(selectedItems: Record<string, number>, availabilityMap: MenuAvailabilityMap) {
  return Object.entries(normalizeSelectedItems(selectedItems))
    .filter(([itemId]) => availabilityMap[itemId] === false)
    .map(([itemId]) => itemId)
}

export function buildUnavailableItemsMessage(itemIds: string[]) {
  const names = itemIds
    .map((itemId) => menuItemMap.get(itemId)?.name.ar)
    .filter((name): name is string => Boolean(name))

  if (names.length === 0) {
    return 'بعض الأصناف غير متوفرة الآن'
  }

  return `بعض الأصناف غير متوفرة الآن: ${names.join(' - ')}`
}

function getDefaultAdminSettings(): AdminSettings {
  return {
    autoClearEnabled: false,
    lastClearedAt: null,
  }
}

export async function getAdminSettings() {
  const orderStore = getOrderStore()
  const value = await orderStore.get(ADMIN_SETTINGS_KEY, { type: 'json' as const })
  const defaults = getDefaultAdminSettings()

  if (!value || typeof value !== 'object') {
    return defaults
  }

  const settings = value as Partial<AdminSettings>
  return {
    autoClearEnabled: typeof settings.autoClearEnabled === 'boolean' ? settings.autoClearEnabled : defaults.autoClearEnabled,
    lastClearedAt: typeof settings.lastClearedAt === 'string' ? settings.lastClearedAt : defaults.lastClearedAt,
  }
}

export async function saveAdminSettings(partialSettings: Partial<AdminSettings>) {
  const orderStore = getOrderStore()
  const currentSettings = await getAdminSettings()
  const nextSettings: AdminSettings = {
    ...currentSettings,
    ...partialSettings,
  }

  await orderStore.setJSON(ADMIN_SETTINGS_KEY, nextSettings)
  return nextSettings
}

export async function clearAllOrders() {
  const orderStore = getOrderStore()
  const { blobs } = await orderStore.list({ prefix: ORDER_KEY_PREFIX })

  await Promise.all(blobs.map((blob) => orderStore.delete(blob.key)))

  const clearedAt = new Date().toISOString()
  await saveAdminSettings({ lastClearedAt: clearedAt })

  return {
    deletedCount: blobs.length,
    clearedAt,
  }
}

export async function clearOrdersIfAutoClearDue() {
  const settings = await getAdminSettings()

  if (!settings.autoClearEnabled || !settings.lastClearedAt) {
    return {
      cleared: false,
      deletedCount: 0,
      settings,
    }
  }

  const lastClearedTime = new Date(settings.lastClearedAt).getTime()

  if (Number.isNaN(lastClearedTime) || Date.now() - lastClearedTime < DAY_IN_MS) {
    return {
      cleared: false,
      deletedCount: 0,
      settings,
    }
  }

  const result = await clearAllOrders()
  const nextSettings = await saveAdminSettings({
    autoClearEnabled: true,
    lastClearedAt: result.clearedAt,
  })

  return {
    cleared: true,
    deletedCount: result.deletedCount,
    settings: nextSettings,
  }
}
