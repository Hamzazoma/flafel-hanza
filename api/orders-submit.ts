import type { Handler } from '@netlify/functions'

import { buildResponse, createOrder, handleOptionsRequest, saveOrder, validateIncomingOrder } from './_lib/orders'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest()
  }

  if (event.httpMethod !== 'POST') {
    return buildResponse(405, { error: 'Method not allowed' })
  }

  let payload = {}

  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return buildResponse(400, { error: 'صيغة البيانات غير صحيحة' })
  }

  const validationError = validateIncomingOrder(payload)

  if (validationError) {
    return buildResponse(400, { error: validationError })
  }

  const order = await saveOrder(createOrder(payload))
  return buildResponse(200, { order })
}
