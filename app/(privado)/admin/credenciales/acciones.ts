'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { professionalCredentials } from '@/lib/db/schema'
import { requerirAdmin } from '@/lib/auth/sesion'
import { registrarAuditoria } from '@/lib/auditoria/registrar'

export async function verificarCredencial(formData: FormData) {
  const sesion = await requerirAdmin()
  const id = String(formData.get('id') ?? '')
  if (!id) return

  await db
    .update(professionalCredentials)
    .set({
      status: 'verificada',
      reviewedBy: sesion.user.id,
      reviewedAt: new Date(),
      rejectionReason: null,
    })
    .where(eq(professionalCredentials.id, id))

  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'approve',
    entity: 'professional_credential',
    entityId: id,
    diff: { status: 'verificada' },
  })

  revalidatePath('/admin/credenciales')
}

export async function rechazarCredencial(formData: FormData) {
  const sesion = await requerirAdmin()
  const id = String(formData.get('id') ?? '')
  const motivo = String(formData.get('motivo') ?? '').trim() || null
  if (!id) return

  await db
    .update(professionalCredentials)
    .set({
      status: 'rechazada',
      reviewedBy: sesion.user.id,
      reviewedAt: new Date(),
      rejectionReason: motivo,
    })
    .where(eq(professionalCredentials.id, id))

  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'update',
    entity: 'professional_credential',
    entityId: id,
    diff: { status: 'rechazada', motivo },
  })

  revalidatePath('/admin/credenciales')
}
