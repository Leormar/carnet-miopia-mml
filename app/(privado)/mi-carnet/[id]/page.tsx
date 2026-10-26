import Link from 'next/link'
import { notFound } from 'next/navigation'

import { requerirAccesoAPaciente } from '@/lib/auth/sesion'
import { fichaDePaciente } from '@/lib/datos/pacientes'
import { RegistroDeUso } from '@/components/formularios/RegistroDeUso'
import { BarraAdherencia } from '@/components/graficas/BarraAdherencia'
import { Aviso, NotaEducativa } from '@/components/ui/Aviso'
import {
  IconoCalendario,
  IconoCompartir,
  IconoTratamiento,
} from '@/components/marca/IconosTratamiento'
import { TRATAMIENTOS } from '@/config/tratamientos'
import { metaEnTexto } from '@/lib/clinica/adherencia'
import { aNumero } from '@/lib/clinica/refraccion'
import { diasEntre, fechaCorta, fechaLarga, sumarDias } from '@/lib/clinica/edad'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const ficha = await fichaDePaciente(params.id)
  return { title: ficha ? `Carnet de ${ficha.paciente.firstName}` : 'Mi carnet' }
}

const DIAS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

export default async function MiCarnet({ params }: { params: { id: string } }) {
  await requerirAccesoAPaciente(params.id, ['profesional_tratante', 'familia'])
  const ficha = await fichaDePaciente(params.id)
  if (!ficha) notFound()

  const { paciente, tratamientosActivos, adherencia, citas, registrosUso, hoy } = ficha
  const proxima = citas.find((c) => c.estadoVigente === 'pendiente')
  const vencidas = citas.filter((c) => c.estadoVigente === 'vencida')

  // Los ultimos 7 dias, para la tira de la semana.
  const semana = Array.from({ length: 7 }, (_, i) => sumarDias(hoy, -(6 - i)))

  return (
    <>
      <h1 className="font-titulo text-2xl">Carnet de {paciente.firstName}</h1>
      <p className="text-sm text-grisTexto">{fechaLarga(hoy)}</p>

      {vencidas.length > 0 && (
        <div className="mt-4">
          <Aviso nivel="alerta" titulo="Hay un control vencido">
            {vencidas.map((c) => `${c.label}, para el ${fechaCorta(c.dueDate)}`).join(' · ')}.
            Pida la cita con su profesional.
          </Aviso>
        </div>
      )}

      {tratamientosActivos.length === 0 ? (
        <div className="mt-5">
          <Aviso>
            No hay un tratamiento activo registrado. Cuando su profesional lo abra, aquí aparecera
            el botón para registrar el uso de cada día.
          </Aviso>
        </div>
      ) : (
        <>
          <section className="mt-5">
            <h2 className="font-titulo text-lg">Registrar hoy</h2>
            <p className="text-sm text-grisTexto">
              Lo que se anota se conversa en el control. Sea sincero: no es un examen.
            </p>
            <div className="mt-3 space-y-3">
              {tratamientosActivos.map((t) => {
                const resumen = adherencia.find((a) => a.tratamiento.id === t.id)
                const registro = resumen?.registroDeHoy ?? null
                return (
                  <RegistroDeUso
                    key={t.id}
                    patientId={paciente.id}
                    fecha={hoy}
                    tratamiento={{
                      id: t.id,
                      tipo: t.type,
                      etiqueta: t.deviceLabel ?? t.concentration,
                      metaTexto: metaEnTexto({
                        id: t.id,
                        type: t.type,
                        startDate: t.startDate,
                        endDate: t.endDate,
                        adherenceGoal: t.adherenceGoal,
                      }),
                    }}
                    existente={
                      registro
                        ? {
                            hours: aNumero(registro.hours),
                            done: registro.done,
                            outdoorMinutes: registro.outdoorMinutes,
                            discomfort: registro.discomfort,
                          }
                        : null
                    }
                  />
                )
              })}
            </div>
          </section>

          <section className="mt-6">
            <h2 className="font-titulo text-lg">Esta semana</h2>
            <div className="mt-3 space-y-3">
              {adherencia.map((a) => {
                const d = TRATAMIENTOS[a.tratamiento.type]
                const registros = registrosUso.filter((r) => r.treatmentId === a.tratamiento.id)
                return (
                  <div key={a.tratamiento.id} className="tarjeta">
                    <div className="flex items-center gap-2">
                      <IconoTratamiento tipo={a.tratamiento.type} className="h-4 w-4" />
                      <p className="font-semibold">{d.nombre}</p>
                    </div>

                    <div className="mt-3 flex gap-1.5">
                      {semana.map((fecha) => {
                        const r = registros.find((x) => x.logDate === fecha)
                        const cumplido =
                          d.modoRegistro === 'horas'
                            ? (aNumero(r?.hours) ?? 0) >=
                              (a.tratamiento.adherenceGoal.horasPorDia ??
                                d.metaPorDefecto.horasPorDia ??
                                0)
                            : r?.done === true
                        const sinRegistro = !r
                        const indiceDia = new Date(fecha + 'T12:00:00').getDay()
                        return (
                          <div key={fecha} className="flex-1 text-center">
                            <div
                              className="mx-auto flex h-9 w-full max-w-[40px] items-center justify-center rounded-lg text-xs font-semibold"
                              style={{
                                background: sinRegistro
                                  ? '#fff'
                                  : cumplido
                                    ? d.color
                                    : '#ddd6c8',
                                color: sinRegistro ? '#5b6570' : cumplido ? '#fff' : '#5b6570',
                                border: sinRegistro ? '1px dashed #ddd6c8' : 'none',
                              }}
                              title={
                                sinRegistro
                                  ? `${fechaCorta(fecha)}: sin registro`
                                  : `${fechaCorta(fecha)}: ${cumplido ? 'cumplido' : 'no cumplido'}`
                              }
                            >
                              {d.modoRegistro === 'horas' && r?.hours
                                ? String(aNumero(r.hours))
                                : sinRegistro
                                  ? ''
                                  : cumplido
                                    ? 'Si'
                                    : 'No'}
                            </div>
                            <span className="mt-1 block text-[11px] text-grisTexto">
                              {DIAS[indiceDia]}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-4 space-y-2.5">
                      <BarraAdherencia resumen={a.siete} titulo="Últimos 7 días" />
                      <BarraAdherencia resumen={a.treinta} titulo="Últimos 30 días" />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}

      <section className="mt-6">
        <h2 className="font-titulo text-lg">Próximo control</h2>
        <div className="tarjeta mt-3 flex items-center gap-3">
          <IconoCalendario className="h-5 w-5 text-azul" />
          {proxima ? (
            <div>
              <p className="font-semibold">{fechaLarga(proxima.dueDate)}</p>
              <p className="text-sm text-grisTexto">
                {proxima.label} · en {diasEntre(hoy, proxima.dueDate)} días
              </p>
            </div>
          ) : (
            <p className="text-sm text-grisTexto">No hay un control programado.</p>
          )}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-titulo text-lg">Compartir con otro profesional</h2>
        <div className="tarjeta mt-3 flex flex-wrap items-center gap-3">
          <IconoCompartir className="h-5 w-5 shrink-0 text-azul" />
          <p className="min-w-0 flex-1 text-sm text-grisMedio">
            Genere un enlace o un código QR de solo lectura para la cita con oftalmología
            pediátrica. Vence solo y usted lo puede revocar.
          </p>
          <Link href={`/pacientes/${paciente.id}/compartir`} className="boton-secundario">
            Generar enlace
          </Link>
        </div>
      </section>

      <div className="mt-6 space-y-2">
        <Aviso titulo="Por que importa el uso">
          Los dispositivos para desacelerar la miopía actúan mientras están puestos. Los resultados
          que se publican en los estudios se lograron con niños que los usaron como se indicó.
          <NotaEducativa className="mt-1.5" />
        </Aviso>
        <p className="text-xs text-grisTexto">
          Si aparece dolor, ojo rojo o secreción, retire el lente y consulte.
        </p>
      </div>

      <Link href="/panel" className="mt-6 inline-block text-sm text-azul hover:underline">
        Ver todos mis pacientes
      </Link>
    </>
  )
}
