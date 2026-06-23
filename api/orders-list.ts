import type { Handler } from '@netlify/functions'

import { buildResponse, handleOptionsRequest, listOrders, requireAdminKey } from './_lib/orders'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest()
  }

  if (event.httpMethod !== 'GET') {
    return buildResponse(405, { error: 'Method not allowed' })
  }

  if (!requireAdminKey(event.headers['x-admin-key'])) {
    return buildResponse(401, { error: 'رمز دخول الإدارة غير صحيح' })
  }

  const orders = await listOrders()
  return buildResponse(200, { orders })
}
