import { redirect } from 'next/navigation'
import type { Session } from 'next-auth'
import { and, eq, isNull, or, gt } from 'drizzle-orm'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { patientAccess, professionals } from '@/lib/db/schema'

export type Sesion = Session

/** Hay sesion iniciada, sin importar si ya fue aprobada. */
export async function sesionActual() {
  return auth()
}

/**
 * Exige sesion iniciada y cuenta aprobada. Es la compuerta del acceso cerrado:
 * quien no haya sido aprobado va a /pendiente, y quien no haya entrado va a
 * /ingresar.
 */
export async function requerirAprobado(): Promise<Sesion> {
  const sesion = await auth()
  if (!sesion?.user) redirect('/ingresar')
  if (sesion.user.status === 'aprobado') return sesion
  redirect('/pendiente')
}

export async function requerirAdmin(): Promise<Sesion> {
  const sesion = await requerirAprobado()
  if (!sesion.user.isAdmin) redirect('/panel')
  return sesion
}

export async function perfilProfesional(userId: string) {
  const filas = await db
    .select()
    .from(professionals)
    .where(eq(professionals.userId, userId))
    .limit(1)
  return filas[0] ?? null
}

export type NivelAcceso = 'profesional_tratante' | 'profesional_invitado' | 'familia' | 'ninguno'

/**
 * Que puede hacer este usuario con este paciente. Un administrador ve todo.
 * Los accesos vencidos o revocados no cuentan.
 */
export async function accesoAPaciente(
  sesion: Sesion,
  patientId: string,
): Promise<NivelAcceso> {
  if (sesion.user.isAdmin) return 'profesional_tratante'

  const ahora = new Date()
  const filas = await db
    .select({ role: patientAccess.role })
    .from(patientAccess)
    .where(
      and(
        eq(patientAccess.patientId, patientId),
        eq(patientAccess.userId, sesion.user.id),
        isNull(patientAccess.revokedAt),
        or(isNull(patientAccess.expiresAt), gt(patientAccess.expiresAt, ahora)),
      ),
    )

  if (filas.some((f) => f.role === 'treating_professional')) return 'profesional_tratante'
  if (filas.some((f) => f.role === 'guest_professional')) return 'profesional_invitado'
  if (filas.some((f) => f.role === 'caregiver')) return 'familia'
  return 'ninguno'
}

export function puedeEditarClinica(nivel: NivelAcceso) {
  return nivel === 'profesional_tratante'
}

export function puedeRegistrarUso(nivel: NivelAcceso) {
  return nivel === 'profesional_tratante' || nivel === 'familia'
}

export async function requerirAccesoAPaciente(
  patientId: string,
  minimo: NivelAcceso[] = ['profesional_tratante', 'profesional_invitado', 'familia'],
) {
  const sesion = await requerirAprobado()
  const nivel = await accesoAPaciente(sesion, patientId)
  if (!minimo.includes(nivel)) redirect('/panel')
  return { sesion, nivel }
}
