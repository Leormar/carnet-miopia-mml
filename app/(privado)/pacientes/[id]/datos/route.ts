import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { consents, patients } from '@/lib/db/schema'
import { requerirAccesoAPaciente } from '@/lib/auth/sesion'
import { registrarAuditoria } from '@/lib/auditoria/registrar'
import { fichaDePaciente } from '@/lib/datos/pacientes'
import { SITIO } from '@/config/sitio'

export const dynamic = 'force-dynamic'

/**
 * Copia completa de los datos del paciente, en un archivo que la familia se
 * puede llevar. Es el derecho de acceso de la Ley 1581 de 2012.
 *
 * Va en JSON porque debe ser legible por otro sistema, no solo por una
 * persona: la version para leer e imprimir es el carnet.
 */
export async function GET(_peticion: Request, { params }: { params: { id: string } }) {
  const { sesion } = await requerirAccesoAPaciente(params.id, [
    'profesional_tratante',
    'familia',
  ])

  const ficha = await fichaDePaciente(params.id)
  if (!ficha) return new Response('No existe', { status: 404 })

  const [paciente] = await db.select().from(patients).where(eq(patients.id, params.id)).limit(1)
  const autorizaciones = await db
    .select()
    .from(consents)
    .where(eq(consents.patientId, params.id))

  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'export',
    entity: 'patient',
    entityId: params.id,
    patientId: params.id,
    diff: { formato: 'json' },
  })

  const copia = {
    generadoEl: new Date().toISOString(),
    generadoPor: sesion.user.email,
    origen: SITIO.url,
    aviso:
      'Copia de los datos personales y de salud registrados en el carnet de seguimiento. ' +
      'Entregada a solicitud del titular o de su representante legal, conforme a la Ley 1581 de 2012.',
    paciente,
    consentimientos: autorizaciones,
    tratamientos: ficha.tratamientos,
    controles: ficha.controles,
    citasProgramadas: ficha.citas,
    registrosDeUso: ficha.registrosUso,
  }

  const nombre = `carnet-${ficha.paciente.lastName}-${ficha.paciente.firstName}`
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')

  return new Response(JSON.stringify(copia, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nombre}.json"`,
      'Cache-Control': 'no-store',
    },
  })
}
