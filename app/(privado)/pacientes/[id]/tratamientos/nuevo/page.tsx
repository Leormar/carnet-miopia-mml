import Link from 'next/link'
import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { patients } from '@/lib/db/schema'
import { requerirAccesoAPaciente } from '@/lib/auth/sesion'
import { FormularioTratamiento } from './FormularioTratamiento'
import { IconoVolver } from '@/components/marca/IconosTratamiento'
import { Aviso } from '@/components/ui/Aviso'
import { aIso } from '@/lib/clinica/edad'

export const metadata = { title: 'Nuevo tratamiento' }

export default async function NuevoTratamiento({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { primero?: string }
}) {
  await requerirAccesoAPaciente(params.id, ['profesional_tratante'])
  const [paciente] = await db.select().from(patients).where(eq(patients.id, params.id)).limit(1)
  if (!paciente) notFound()

  return (
    <>
      <Link
        href={`/pacientes/${params.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-azul hover:underline"
      >
        <IconoVolver className="h-4 w-4" />
        {paciente.firstName} {paciente.lastName}
      </Link>
      <h1 className="mt-2 font-titulo text-2xl">Nuevo tratamiento</h1>

      {searchParams.primero === '1' && (
        <div className="mb-4 mt-3">
          <Aviso titulo="Paciente creado">
            Ahora abra el tratamiento. Con la fecha de inicio se genera el calendario de controles
            del primer ano.
          </Aviso>
        </div>
      )}

      <div className="mt-4">
        <FormularioTratamiento patientId={params.id} hoy={aIso(new Date())} />
      </div>
    </>
  )
}
