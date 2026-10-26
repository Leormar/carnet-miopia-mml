/**
 * El mismo consentimiento, con los datos del niño ya impresos. Es el que se
 * firma: queda la constancia en papel y el registro en la aplicacion.
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { perfilProfesional, requerirAccesoAPaciente } from '@/lib/auth/sesion'
import { fichaDePaciente } from '@/lib/datos/pacientes'
import { registrarAuditoria } from '@/lib/auditoria/registrar'
import { BotonImprimir } from '@/components/carnet/BotonImprimir'
import { IconoVolver } from '@/components/marca/IconosTratamiento'
import { fechaCorta } from '@/lib/clinica/edad'
import {
  DocumentoConsentimiento,
  type DatosConsentimiento,
} from '@/components/consentimiento/DocumentoConsentimiento'

export const metadata = { title: 'Consentimiento informado' }
export const dynamic = 'force-dynamic'

export default async function ConsentimientoDelPaciente({
  params,
}: {
  params: { id: string }
}) {
  const { sesion } = await requerirAccesoAPaciente(params.id)
  const ficha = await fichaDePaciente(params.id)
  if (!ficha) notFound()

  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'export',
    entity: 'consentimiento',
    entityId: params.id,
    patientId: params.id,
  })

  const perfil = await perfilProfesional(sesion.user.id)
  const [usuario] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, sesion.user.id))
    .limit(1)

  const datos: DatosConsentimiento = {
    nombreMenor: `${ficha.paciente.firstName} ${ficha.paciente.lastName}`,
    fechaNacimiento: fechaCorta(ficha.paciente.birthDate),
    profesional: perfil?.displayName ?? usuario?.name ?? null,
    institucion: perfil?.institution ?? null,
  }

  return (
    <>
      <div className="no-imprimir">
        <Link
          href={`/pacientes/${params.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-azul hover:underline"
        >
          <IconoVolver className="h-4 w-4" />
          {ficha.paciente.firstName} {ficha.paciente.lastName}
        </Link>
        <div className="mt-2 flex flex-wrap items-end gap-3">
          <div>
            <h1 className="font-titulo text-2xl">Consentimiento informado</h1>
            <p className="mt-1 max-w-2xl text-sm text-grisTexto">
              Dos hojas A4 vertical con los datos del niño ya puestos. Guardelo en PDF para
              mandarlo, o imprimalo para firmarlo en consulta. Firmado, archivelo con la historia.
            </p>
          </div>
          <div className="ml-auto">
            <BotonImprimir />
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto print:mt-0 print:overflow-visible">
        <DocumentoConsentimiento datos={datos} />
      </div>
    </>
  )
}
