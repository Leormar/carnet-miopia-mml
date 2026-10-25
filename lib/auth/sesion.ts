import { redirect } from 'next/navigation'
import type { Session } from 'next-auth'
import { and, desc, eq, gte, isNull, or, gt } from 'drizzle-orm'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import {
  auditLog,
  patientAccess,
  professionalCredentials,
  professionals,
  userAgreements,
} from '@/lib/db/schema'
import { VERSION_COMPROMISO } from '@/config/compromiso'

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
  if (sesion.user.status !== 'aprobado') redirect('/pendiente')

  const falta = await pasoPendiente(sesion)
  if (falta === 'compromiso') redirect('/acceso/compromiso')
  if (falta === 'credencial') redirect('/acceso/credencial')

  return sesion
}

/**
 * Sesion aprobada sin las compuertas de entrada. La usan las propias paginas
 * de compromiso y credencial, que si no se redirigirian a si mismas.
 */
export async function requerirAprobadoSinCompuertas(): Promise<Sesion> {
  const sesion = await auth()
  if (!sesion?.user) redirect('/ingresar')
  if (sesion.user.status !== 'aprobado') redirect('/pendiente')
  return sesion
}

export type PasoPendiente = 'compromiso' | 'credencial' | null

/**
 * Que le falta a esta persona para poder entrar.
 *
 * Solo se le exige a quien ejerce: un familiar entra por invitacion a un
 * paciente concreto y su consentimiento se recoge al crear la historia.
 * Una credencial subida basta para trabajar; la verificacion del
 * administrador es posterior, para no dejar a nadie esperando.
 */
export async function pasoPendiente(sesion: Sesion): Promise<PasoPendiente> {
  if (!(await ejerceEnLaRed(sesion))) return null

  const [acuerdo] = await db
    .select({ id: userAgreements.id })
    .from(userAgreements)
    .where(
      and(
        eq(userAgreements.userId, sesion.user.id),
        eq(userAgreements.kind, 'manejo_informacion'),
        eq(userAgreements.version, VERSION_COMPROMISO),
      ),
    )
    .limit(1)
  if (!acuerdo) return 'compromiso'

  const [credencial] = await db
    .select({ status: professionalCredentials.status })
    .from(professionalCredentials)
    .where(eq(professionalCredentials.userId, sesion.user.id))
    .orderBy(desc(professionalCredentials.uploadedAt))
    .limit(1)
  if (!credencial || credencial.status === 'rechazada') return 'credencial'

  return null
}

/** Es profesional de la red, y no un familiar invitado a un paciente. */
export async function ejerceEnLaRed(sesion: Sesion): Promise<boolean> {
  if (sesion.user.isAdmin) return true
  const [fila] = await db
    .select({ id: professionals.id })
    .from(professionals)
    .where(eq(professionals.userId, sesion.user.id))
    .limit(1)
  return Boolean(fila)
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
  await registrarConsultaDelDia(sesion.user.id, patientId)
  return { sesion, nivel }
}

/**
 * Deja constancia de que esta persona consulto esta historia.
 *
 * Se anota una vez por dia y por paciente, no una vez por pantalla: la ficha,
 * el carnet y el formulario de control son la misma consulta. Lo que importa
 * para la auditoria es quien entro y que dia, no cuantas veces recargo.
 */
async function registrarConsultaDelDia(userId: string, patientId: string) {
  const inicioDelDia = new Date()
  inicioDelDia.setHours(0, 0, 0, 0)

  const [yaAnotado] = await db
    .select({ id: auditLog.id })
    .from(auditLog)
    .where(
      and(
        eq(auditLog.actorUserId, userId),
        eq(auditLog.patientId, patientId),
        eq(auditLog.action, 'read'),
        gte(auditLog.at, inicioDelDia),
      ),
    )
    .limit(1)
  if (yaAnotado) return

  const { registrarAuditoria } = await import('@/lib/auditoria/registrar')
  await registrarAuditoria({
    actorUserId: userId,
    action: 'read',
    entity: 'patient',
    entityId: patientId,
    patientId,
  })
}
