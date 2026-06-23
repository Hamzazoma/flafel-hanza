import type { Handler } from '@netlify/functions'

import {
  buildResponse,
  createOrder,
  handleOptionsRequest,
  initializeBlobs,
  saveOrder,
  validateIncomingOrder,
  type IncomingOrderPayload,
} from './_lib/orders'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest()
  }

  if (event.httpMethod !== 'POST') {
    return buildResponse(405, { error: 'Method not allowed' })
  }

  let payload: Partial<IncomingOrderPayload> = {}

  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return buildResponse(400, { error: 'صيغة البيانات غير صحيحة' })
  }

  const validationError = validateIncomingOrder(payload)

  if (validationError) {
    return buildResponse(400, { error: validationError })
  }

  const orderPayload: IncomingOrderPayload = {
    customerName: payload.customerName?.trim() ?? '',
    phone: payload.phone?.trim() ?? '',
    address: payload.address?.trim() ?? '',
    pickupTime: payload.pickupTime?.trim() ?? '',
    notes: payload.notes?.trim() ?? '',
    serviceType: payload.serviceType === 'delivery' ? 'delivery' : 'pickup',
    selectedItems: payload.selectedItems ?? {},
  }

  initializeBlobs(event)
  const order = await saveOrder(createOrder(orderPayload))
  return buildResponse(200, { order })
}
