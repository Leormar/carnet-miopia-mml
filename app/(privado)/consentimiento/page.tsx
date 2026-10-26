/**
 * El consentimiento en blanco, para mandarselo a la familia antes de la cita.
 * La version con los datos del niño ya puestos vive en la ficha del paciente.
 */

import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { perfilProfesional, requerirAprobado } from '@/lib/auth/sesion'
import { BotonImprimir } from '@/components/carnet/BotonImprimir'
import {
  DocumentoConsentimiento,
  type DatosConsentimiento,
} from '@/components/consentimiento/DocumentoConsentimiento'

export const metadata = { title: 'Consentimiento informado' }
export const dynamic = 'force-dynamic'

export default async function ConsentimientoEnBlanco() {
  const sesion = await requerirAprobado()

  const perfil = await perfilProfesional(sesion.user.id)
  const [usuario] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, sesion.user.id))
    .limit(1)

  const datos: DatosConsentimiento = {
    nombreMenor: null,
    fechaNacimiento: null,
    profesional: perfil?.displayName ?? usuario?.name ?? null,
    institucion: perfil?.institution ?? null,
  }

  return (
    <>
      <div className="no-imprimir">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <h1 className="font-titulo text-2xl">Consentimiento informado</h1>
            <p className="mt-1 max-w-2xl text-sm text-grisTexto">
              Dos hojas A4 vertical, con su nombre ya puesto y el del niño en blanco. Guardelo en
              PDF y mandeselo a la familia para que lo lea antes de la cita, o imprimalo y
              firmenlo en consulta. En el diálogo de impresión elija Guardar como PDF, tamaño A4,
              orientación vertical y márgenes ninguno.
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
