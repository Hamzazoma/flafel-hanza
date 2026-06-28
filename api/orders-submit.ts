import type { Handler } from '@netlify/functions'

import {
  buildUnavailableItemsMessage,
  buildResponse,
  clearOrdersIfAutoClearDue,
  createOrder,
  getMenuAvailabilityMap,
  getUnavailableSelectedItemIds,
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

  initializeBlobs(event)
  await clearOrdersIfAutoClearDue()

  const availabilityMap = await getMenuAvailabilityMap()
  const unavailableItemIds = getUnavailableSelectedItemIds(payload.selectedItems ?? {}, availabilityMap)

  if (unavailableItemIds.length > 0) {
    return buildResponse(400, { error: buildUnavailableItemsMessage(unavailableItemIds) })
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

  const order = await saveOrder(createOrder(orderPayload))
  return buildResponse(200, { order })
}
