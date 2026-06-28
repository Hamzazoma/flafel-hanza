import type { Handler } from '@netlify/functions'

import {
  buildResponse,
  clearAllOrders,
  handleOptionsRequest,
  initializeBlobs,
  requireAdminKey,
} from './_lib/orders'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest()
  }

  if (event.httpMethod !== 'DELETE') {
    return buildResponse(405, { error: 'Method not allowed' })
  }

  if (!requireAdminKey(event.headers['x-admin-key'])) {
    return buildResponse(401, { error: 'رمز دخول الإدارة غير صحيح' })
  }

  initializeBlobs(event)
  const result = await clearAllOrders()
  return buildResponse(200, result)
}
