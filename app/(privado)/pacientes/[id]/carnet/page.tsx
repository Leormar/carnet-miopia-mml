import Link from 'next/link'
import { notFound } from 'next/navigation'
import { eq, inArray } from 'drizzle-orm'

import { db } from '@/lib/db'
import { examTreatmentFindings, professionals, users } from '@/lib/db/schema'
import { requerirAccesoAPaciente } from '@/lib/auth/sesion'
import { fichaDePaciente } from '@/lib/datos/pacientes'
import { registrarAuditoria } from '@/lib/auditoria/registrar'
import { Carnet, type DatosCarnet } from '@/components/carnet/Carnet'
import { BotonImprimir } from '@/components/carnet/BotonImprimir'
import { IconoVolver } from '@/components/marca/IconosTratamiento'
import { TRATAMIENTOS } from '@/config/tratamientos'
import { formatoRefraccion } from '@/lib/clinica/refraccion'

export const metadata = { title: 'Carnet' }
export const dynamic = 'force-dynamic'

export default async function CarnetDelPaciente({ params }: { params: { id: string } }) {
  const { sesion } = await requerirAccesoAPaciente(params.id)
  const ficha = await fichaDePaciente(params.id)
  if (!ficha) notFound()

  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'export',
    entity: 'carnet',
    entityId: params.id,
    patientId: params.id,
  })

  const [perfil] = await db
    .select({ displayName: professionals.displayName, institution: professionals.institution })
    .from(professionals)
    .where(eq(professionals.userId, sesion.user.id))
    .limit(1)
  const [usuario] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, sesion.user.id))
    .limit(1)

  const idsControles = ficha.controles.map((c) => c.id)
  const hallazgos =
    idsControles.length > 0
      ? await db
          .select()
          .from(examTreatmentFindings)
          .where(inArray(examTreatmentFindings.examId, idsControles))
      : []

  const primero = [...ficha.tratamientos].sort((a, b) => a.startDate.localeCompare(b.startDate))[0]

  const datos: DatosCarnet = {
    nombre: `${ficha.paciente.firstName} ${ficha.paciente.lastName}`,
    fechaNacimiento: ficha.paciente.birthDate,
    edadInicioMiopia: ficha.paciente.myopiaOnsetAge
      ? `${String(ficha.paciente.myopiaOnsetAge).replace('.', ',')} anos`
      : null,
    padresMiopes: ficha.paciente.myopicParents,
    tiposActivos: ficha.tratamientosActivos.map((t) => t.type),
    fechaInicioTratamiento: primero?.startDate ?? null,
    profesional:
      perfil?.displayName ?? usuario?.name ?? perfil?.institution ?? null,
    oftalmologo: ficha.paciente.ophthalmologistName,
    filas: ficha.controles.map((c) => ({
      fecha: c.examDate,
      edad: c.edad,
      avOd: c.vaOd,
      avOi: c.vaOi,
      refraccionOd: formatoRefraccion(c.sphereOd, c.cylOd, c.axisOd),
      refraccionOi: formatoRefraccion(c.sphereOi, c.cylOi, c.axisOi),
      alOd: c.alOd ? String(c.alOd).replace('.', ',') : null,
      alOi: c.alOi ? String(c.alOi).replace('.', ',') : null,
      crecimientoOd: c.doceMesesOd?.mmPorAno ?? null,
      crecimientoOi: c.doceMesesOi?.mmPorAno ?? null,
      equipo: c.biometerNombre,
      horasUso: c.reportedHoursPerDay
        ? `${String(c.reportedHoursPerDay).replace('.', ',')} h`
        : null,
      aireLibre: c.outdoorHoursPerDay
        ? `${String(c.outdoorHoursPerDay).replace('.', ',')} h`
        : null,
      proximoControl: c.nextExamDate,
    })),
    filasTratamiento: ficha.controles
      .map((c) => {
        const delControl = hallazgos.filter((h) => h.examId === c.id)
        const texto = delControl
          .map((h) => {
            const tratamiento = ficha.tratamientos.find((t) => t.id === h.treatmentId)
            const definicion = tratamiento ? TRATAMIENTOS[tratamiento.type] : null
            const partes = Object.entries(h.data)
              .map(([clave, valor]) => {
                const etiqueta =
                  definicion?.hallazgos.find((x) => x.clave === clave)?.etiqueta ?? clave
                return `${etiqueta}: ${valor}`
              })
              .join('. ')
            return definicion ? `${definicion.nombreCorto}. ${partes}` : partes
          })
          .join(' | ')
        return {
          fecha: c.examDate,
          hallazgos: texto,
          molestias: c.adverseEvents ?? '',
          decision: c.decision ?? '',
        }
      })
      .filter((f) => f.hallazgos || f.molestias || f.decision),
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
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <div>
            <h1 className="font-titulo text-2xl">Carnet</h1>
            <p className="text-sm text-grisTexto">
              Dos paginas A4 horizontal. En el dialogo de impresión elija Guardar como PDF, tamaño
              A4, orientación horizontal y margenes ninguno.
            </p>
          </div>
          <div className="ml-auto">
            <BotonImprimir />
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto print:mt-0 print:overflow-visible">
        <Carnet datos={datos} />
      </div>
    </>
  )
}
