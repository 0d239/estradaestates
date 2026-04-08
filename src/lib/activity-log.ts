import { supabase } from './supabase'
import type { ActivityAction, ActivityEntityType } from './database.types'

/**
 * Insert an activity log entry. Fire-and-forget — errors are logged but don't
 * block the calling mutation.
 */
export async function logActivity({
  actorId,
  action,
  entityType,
  entityId,
  metadata = {},
  note,
}: {
  actorId: string | null
  action: ActivityAction
  entityType: ActivityEntityType
  entityId?: string | null
  metadata?: Record<string, unknown>
  note?: string | null
}) {
  const { error } = await supabase.from('activity_logs').insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    metadata,
    note: note ?? null,
  })

  if (error) {
    console.error('[activity-log] Failed to insert log:', error.message, { action, entityType, entityId })
  }
}
