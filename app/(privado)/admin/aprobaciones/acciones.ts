'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { memberships, organizations, professionals, users } from '@/lib/db/schema'
import { requerirAdmin } from '@/lib/auth/sesion'
import { registrarAuditoria } from '@/lib/auditoria/registrar'
import { SITIO } from '@/config/sitio'

async function organizacionMml(): Promise<string> {
  const [existente] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, 'mml'))
    .limit(1)
  if (existente) return existente.id
  const [nueva] = await db
    .insert(organizations)
    .values({ name: SITIO.organizacion, slug: 'mml' })
    .returning({ id: organizations.id })
  return nueva.id
}

export async function aprobarUsuario(formData: FormData) {
  const sesion = await requerirAdmin()
  const userId = String(formData.get('userId') ?? '')
  const perfil = String(formData.get('perfil') ?? 'profesional')
  if (!userId) return

  await db
    .update(users)
    .set({
      status: 'aprobado',
      approvedBy: sesion.user.id,
      approvedAt: new Date(),
      rejectionReason: null,
    })
    .where(eq(users.id, userId))

  // Un profesional entra a la organizacion y obtiene su perfil clinico.
  // Un familiar no: su acceso se concede paciente por paciente.
  if (perfil === 'profesional') {
    const orgId = await organizacionMml()
    await db
      .insert(memberships)
      .values({ userId, orgId, role: 'professional' })
      .onConflictDoNothing()
    await db
      .insert(professionals)
      .values({ userId, orgId, profession: 'optometra' })
      .onConflictDoNothing()
  }

  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'approve',
    entity: 'user',
    entityId: userId,
    diff: { status: 'aprobado', perfil },
  })

  revalidatePath('/admin/aprobaciones')
}

export async function rechazarUsuario(formData: FormData) {
  const sesion = await requerirAdmin()
  const userId = String(formData.get('userId') ?? '')
  const motivo = String(formData.get('motivo') ?? '').trim() || null
  if (!userId) return

  await db
    .update(users)
    .set({ status: 'rechazado', rejectionReason: motivo, approvedBy: sesion.user.id })
    .where(eq(users.id, userId))

  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'update',
    entity: 'user',
    entityId: userId,
    diff: { status: 'rechazado', motivo },
  })

  revalidatePath('/admin/aprobaciones')
}

export async function reactivarUsuario(formData: FormData) {
  const sesion = await requerirAdmin()
  const userId = String(formData.get('userId') ?? '')
  if (!userId) return
  await db
    .update(users)
    .set({ status: 'pendiente', rejectionReason: null })
    .where(eq(users.id, userId))
  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'update',
    entity: 'user',
    entityId: userId,
    diff: { status: 'pendiente' },
  })
  revalidatePath('/admin/aprobaciones')
}
