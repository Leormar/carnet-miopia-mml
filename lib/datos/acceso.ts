import { and, eq, gt, isNull, or } from 'drizzle-orm'

import { db } from '@/lib/db'
import { patientAccess } from '@/lib/db/schema'
import type { Sesion } from '@/lib/auth/sesion'

/**
 * Que roles tiene el usuario sobre pacientes. Sirve para decidir a donde lo
 * lleva la aplicacion al entrar: un profesional al panel, una familia al carnet
 * de su hijo.
 */
export async function rolesDelUsuario(sesion: Sesion) {
  if (sesion.user.isAdmin) {
    return { soloFamilia: false, unicoPaciente: null as string | null, pacientes: [] as string[] }
  }

  const ahora = new Date()
  const filas = await db
    .select({ patientId: patientAccess.patientId, role: patientAccess.role })
    .from(patientAccess)
    .where(
      and(
        eq(patientAccess.userId, sesion.user.id),
        isNull(patientAccess.revokedAt),
        or(isNull(patientAccess.expiresAt), gt(patientAccess.expiresAt, ahora)),
      ),
    )

  const pacientes = Array.from(new Set(filas.map((f) => f.patientId)))
  const soloFamilia = filas.length > 0 && filas.every((f) => f.role === 'caregiver')

  return {
    soloFamilia,
    unicoPaciente: pacientes.length === 1 ? pacientes[0] : null,
    pacientes,
  }
}
