import type { Handler } from '@netlify/functions'

import {
  buildResponse,
  clearOrdersIfAutoClearDue,
  getAdminSettings,
  handleOptionsRequest,
  initializeBlobs,
  requireAdminKey,
  saveAdminSettings,
} from './_lib/orders'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest()
  }

  if (!requireAdminKey(event.headers['x-admin-key'])) {
    return buildResponse(401, { error: 'رمز دخول الإدارة غير صحيح' })
  }

  initializeBlobs(event)
  await clearOrdersIfAutoClearDue()

  if (event.httpMethod === 'GET') {
    const settings = await getAdminSettings()
    return buildResponse(200, { settings })
  }

  if (event.httpMethod !== 'PATCH') {
    return buildResponse(405, { error: 'Method not allowed' })
  }

  let payload: {
    autoClearEnabled?: boolean
  }

  try {
    payload = JSON.parse(event.body || '{}') as {
      autoClearEnabled?: boolean
    }
  } catch {
    return buildResponse(400, { error: 'صيغة البيانات غير صحيحة' })
  }

  if (typeof payload.autoClearEnabled !== 'boolean') {
    return buildResponse(400, { error: 'حالة الحذف التلقائي غير صحيحة' })
  }

  const currentSettings = await getAdminSettings()
  const settings = await saveAdminSettings({
    autoClearEnabled: payload.autoClearEnabled,
    lastClearedAt:
      payload.autoClearEnabled && !currentSettings.autoClearEnabled ? new Date().toISOString() : currentSettings.lastClearedAt,
  })

  return buildResponse(200, { settings })
}
