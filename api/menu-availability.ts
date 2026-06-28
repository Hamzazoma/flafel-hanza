import type { Handler } from '@netlify/functions'

import {
  buildResponse,
  clearOrdersIfAutoClearDue,
  getMenuAvailabilityMap,
  handleOptionsRequest,
  initializeBlobs,
  requireAdminKey,
  saveMenuAvailabilityMap,
} from './_lib/orders'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest()
  }

  initializeBlobs(event)
  await clearOrdersIfAutoClearDue()

  if (event.httpMethod === 'GET') {
    const availability = await getMenuAvailabilityMap()
    return buildResponse(200, { availability })
  }

  if (event.httpMethod !== 'PATCH') {
    return buildResponse(405, { error: 'Method not allowed' })
  }

  if (!requireAdminKey(event.headers['x-admin-key'])) {
    return buildResponse(401, { error: 'رمز دخول الإدارة غير صحيح' })
  }

  let payload: {
    availability?: Record<string, boolean>
  }

  try {
    payload = JSON.parse(event.body || '{}') as {
      availability?: Record<string, boolean>
    }
  } catch {
    return buildResponse(400, { error: 'صيغة البيانات غير صحيحة' })
  }

  if (!payload.availability || typeof payload.availability !== 'object') {
    return buildResponse(400, { error: 'بيانات التوفر غير صحيحة' })
  }

  const availability = await saveMenuAvailabilityMap(payload.availability)
  return buildResponse(200, { availability })
}
