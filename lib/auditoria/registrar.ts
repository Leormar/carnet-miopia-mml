import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { auditLog } from '@/lib/db/schema'

type Accion =
  | 'create' | 'update' | 'delete' | 'read'
  | 'export' | 'share' | 'revoke' | 'login' | 'approve'

/**
 * Bitacora de auditoria. Se inserta y nunca se modifica.
 * Exigida para datos de salud de menores (Ley 1581 de 2012).
 */
export async function registrarAuditoria(entrada: {
  actorUserId: string | null
  action: Accion
  entity: string
  entityId?: string | null
  patientId?: string | null
  diff?: Record<string, unknown> | null
}) {
  let ip: string | null = null
  let userAgent: string | null = null
  try {
    const h = headers()
    ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    userAgent = h.get('user-agent')
  } catch {
    // Fuera de un contexto de peticion, se registra sin estos datos.
  }

  await db.insert(auditLog).values({
    actorUserId: entrada.actorUserId,
    action: entrada.action,
    entity: entrada.entity,
    entityId: entrada.entityId ?? null,
    patientId: entrada.patientId ?? null,
    diff: entrada.diff ?? null,
    ip,
    userAgent,
  })
}
