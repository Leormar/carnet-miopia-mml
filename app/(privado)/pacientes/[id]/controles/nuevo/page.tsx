import Link from 'next/link'
import { notFound } from 'next/navigation'

import { requerirAccesoAPaciente } from '@/lib/auth/sesion'
import { fichaDePaciente } from '@/lib/datos/pacientes'
import { FormularioControl } from './FormularioControl'
import { IconoVolver } from '@/components/marca/IconosTratamiento'
import { aIso } from '@/lib/clinica/edad'

export const metadata = { title: 'Nuevo control' }
export const dynamic = 'force-dynamic'

export default async function NuevoControl({ params }: { params: { id: string } }) {
  await requerirAccesoAPaciente(params.id, ['profesional_tratante'])
  const ficha = await fichaDePaciente(params.id)
  if (!ficha) notFound()

  const ultimoConEquipo = [...ficha.controles].reverse().find((c) => c.biometerId)

  return (
    <>
      <Link
        href={`/pacientes/${params.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-azul hover:underline"
      >
        <IconoVolver className="h-4 w-4" />
        {ficha.paciente.firstName} {ficha.paciente.lastName}
      </Link>
      <h1 className="mt-2 font-titulo text-2xl">Nuevo control</h1>
      <p className="mb-4 mt-1 text-sm text-grisTexto">
        Deje en blanco lo que no haya medido. El equivalente esferico se calcula solo.
      </p>

      <FormularioControl
        patientId={params.id}
        hoy={aIso(new Date())}
        equipos={ficha.equipos.map((q) => ({ id: q.id, name: q.name }))}
        equipoUltimo={ultimoConEquipo?.biometerId ?? null}
        tratamientosActivos={ficha.tratamientosActivos.map((t) => ({
          id: t.id,
          type: t.type,
          deviceLabel: t.deviceLabel,
          concentration: t.concentration,
        }))}
      />
    </>
  )
}
