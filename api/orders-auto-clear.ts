import type { Handler } from '@netlify/functions'

import { buildResponse, clearOrdersIfAutoClearDue, initializeBlobs } from './_lib/orders'

export const handler: Handler = async (event) => {
  initializeBlobs(event)

  const result = await clearOrdersIfAutoClearDue()

  return buildResponse(200, {
    ok: true,
    cleared: result.cleared,
    deletedCount: result.deletedCount,
    autoClearEnabled: result.settings.autoClearEnabled,
    lastClearedAt: result.settings.lastClearedAt,
  })
}
