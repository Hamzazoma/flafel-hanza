import type { Handler } from '@netlify/functions'

import { buildResponse, handleOptionsRequest, initializeBlobs, requireAdminKey, updateOrderStatus, type OrderStatus } from './_lib/orders'

const allowedStatuses: OrderStatus[] = ['new', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled']

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest()
  }

  if (event.httpMethod !== 'PATCH') {
    return buildResponse(405, { error: 'Method not allowed' })
  }

  if (!requireAdminKey(event.headers['x-admin-key'])) {
    return buildResponse(401, { error: 'رمز دخول الإدارة غير صحيح' })
  }

  let payload: {
    orderId?: string
    status?: OrderStatus
  }

  try {
    payload = JSON.parse(event.body || '{}') as {
      orderId?: string
      status?: OrderStatus
    }
  } catch {
    return buildResponse(400, { error: 'صيغة البيانات غير صحيحة' })
  }

  if (!payload.orderId?.trim()) {
    return buildResponse(400, { error: 'رقم الطلب مطلوب' })
  }

  if (!payload.status || !allowedStatuses.includes(payload.status)) {
    return buildResponse(400, { error: 'حالة الطلب غير صحيحة' })
  }

  initializeBlobs(event)
  const order = await updateOrderStatus(payload.orderId, payload.status)

  if (!order) {
    return buildResponse(404, { error: 'الطلب غير موجود' })
  }

  return buildResponse(200, { order })
}
