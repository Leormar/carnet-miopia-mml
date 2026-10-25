import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { professionalCredentials } from '@/lib/db/schema'
import { requerirAdmin } from '@/lib/auth/sesion'
import { registrarAuditoria } from '@/lib/auditoria/registrar'

export const dynamic = 'force-dynamic'

/** Entrega el documento de acreditacion. Solo un administrador, y queda anotado. */
export async function GET(_peticion: Request, { params }: { params: { id: string } }) {
  const sesion = await requerirAdmin()

  const [fila] = await db
    .select()
    .from(professionalCredentials)
    .where(eq(professionalCredentials.id, params.id))
    .limit(1)

  if (!fila) return new Response('No existe', { status: 404 })

  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'read',
    entity: 'professional_credential',
    entityId: fila.id,
    diff: { archivo: fila.fileName },
  })

  return new Response(Buffer.from(fila.content, 'base64'), {
    headers: {
      'Content-Type': fila.mimeType,
      'Content-Disposition': `inline; filename="${encodeURIComponent(fila.fileName)}"`,
      'Cache-Control': 'no-store',
    },
  })
}
