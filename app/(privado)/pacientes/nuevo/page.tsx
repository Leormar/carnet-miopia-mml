import Link from 'next/link'

import { requerirAprobado } from '@/lib/auth/sesion'
import { FormularioPaciente } from './FormularioPaciente'
import { IconoVolver } from '@/components/marca/IconosTratamiento'

export const metadata = { title: 'Nuevo paciente' }

export default async function NuevoPaciente() {
  await requerirAprobado()
  return (
    <>
      <Link href="/panel" className="inline-flex items-center gap-1.5 text-sm text-azul hover:underline">
        <IconoVolver className="h-4 w-4" />
        Pacientes
      </Link>
      <h1 className="mt-2 font-titulo text-2xl">Nuevo paciente</h1>
      <p className="mt-1 text-sm text-grisTexto">
        Al guardar se registra el consentimiento y se abre el formulario del primer tratamiento.{' '}
        <Link href="/consentimiento" className="font-semibold text-azul hover:underline">
          Ver el documento que firma la familia
        </Link>
        .
      </p>
      <div className="mb-5" />
      <FormularioPaciente />
    </>
  )
}
