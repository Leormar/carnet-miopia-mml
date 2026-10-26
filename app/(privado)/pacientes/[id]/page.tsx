import Link from 'next/link'
import { notFound } from 'next/navigation'

import { requerirAccesoAPaciente } from '@/lib/auth/sesion'
import { fichaDePaciente } from '@/lib/datos/pacientes'
import { TarjetaSemaforo } from '@/components/marca/Semaforo'
import { BarraAdherencia } from '@/components/graficas/BarraAdherencia'
import { GraficaLongitudAxial } from '@/components/graficas/GraficaLongitudAxial'
import { GraficaRefraccion } from '@/components/graficas/GraficaRefraccion'
import { RegistroDeUso } from '@/components/formularios/RegistroDeUso'
import { TablaControles } from '@/components/paciente/TablaControles'
import { Aviso, NotaEducativa } from '@/components/ui/Aviso'
import {
  IconoCalendario,
  IconoCandado,
  IconoCompartir,
  IconoImprimir,
  IconoMas,
  IconoTratamiento,
  IconoVolver,
} from '@/components/marca/IconosTratamiento'
import { TRATAMIENTOS } from '@/config/tratamientos'
import { aFecha, edadEnAnos, fechaCorta, fechaLarga } from '@/lib/clinica/edad'
import { aNumero } from '@/lib/clinica/refraccion'
import { formatoMm } from '@/lib/clinica/crecimiento'
import { lecturaConjunta, metaEnTexto } from '@/lib/clinica/adherencia'
import { etiquetaEstado } from '@/lib/clinica/calendario'
import { terminarTratamiento } from '../acciones'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const ficha = await fichaDePaciente(params.id)
  return { title: ficha ? `${ficha.paciente.firstName} ${ficha.paciente.lastName}` : 'Paciente' }
}

export default async function Paciente({ params }: { params: { id: string } }) {
  const { nivel } = await requerirAccesoAPaciente(params.id)
  const ficha = await fichaDePaciente(params.id)
  if (!ficha) notFound()

  const puedeEditar = nivel === 'profesional_tratante'
  const { paciente, controles, tratamientos, tratamientosActivos, adherencia, citas, hoy } = ficha

  const ultimo = controles[controles.length - 1] ?? null
  const edad = edadEnAnos(paciente.birthDate, hoy)

  const vencidos = citas.filter((c) => c.estadoVigente === 'vencida')
  const proximas = citas.filter((c) => c.estadoVigente === 'pendiente').slice(0, 4)

  const adherencia30 = adherencia
    .map((a) => a.treinta.porcentaje)
    .filter((p): p is number => p !== null)
  const promedio30 =
    adherencia30.length > 0
      ? Math.round(adherencia30.reduce((a, b) => a + b, 0) / adherencia30.length)
      : null

  const peorColor =
    ultimo &&
    (ultimo.semaforoOd.color === 'rojo' || ultimo.semaforoOi.color === 'rojo'
      ? 'rojo'
      : ultimo.semaforoOd.color === 'amarillo' || ultimo.semaforoOi.color === 'amarillo'
        ? 'amarillo'
        : ultimo.semaforoOd.color)

  const textoConjunto = ultimo ? lecturaConjunta(peorColor ?? 'sin_color', promedio30) : null

  const cambioDeEquipo =
    ultimo?.doceMesesOd?.cambioDeEquipo || ultimo?.doceMesesOi?.cambioDeEquipo

  const datosAxial = controles
    .filter((c) => c.alOd !== null || c.alOi !== null)
    .map((c) => ({
      fecha: c.examDate,
      t: aFecha(c.examDate).getTime(),
      od: aNumero(c.alOd),
      oi: aNumero(c.alOi),
      equipo: c.biometerNombre,
    }))

  const datosRefraccion = controles
    .filter((c) => c.seOd !== null || c.seOi !== null)
    .map((c) => ({
      fecha: c.examDate,
      t: aFecha(c.examDate).getTime(),
      od: aNumero(c.seOd),
      oi: aNumero(c.seOi),
    }))

  const marcas = tratamientos.map((t) => ({
    t: aFecha(t.startDate).getTime(),
    fecha: t.startDate,
    tipo: t.type,
    etiqueta: TRATAMIENTOS[t.type].nombreCorto,
  }))

  return (
    <>
      <Link href="/panel" className="inline-flex items-center gap-1.5 text-sm text-azul hover:underline">
        <IconoVolver className="h-4 w-4" />
        Pacientes
      </Link>

      <div className="mt-2 flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-titulo text-2xl">
            {paciente.firstName} {paciente.lastName}
          </h1>
          <p className="text-sm text-grisTexto">
            {edad} años · nació el {fechaLarga(paciente.birthDate)}
            {paciente.myopicParents !== null &&
              ` · ${paciente.myopicParents === 0 ? 'ningun padre miope' : paciente.myopicParents === 1 ? 'un padre miope' : 'dos padres miopes'}`}
            {paciente.myopiaOnsetAge &&
              ` · miopia desde los ${String(paciente.myopiaOnsetAge).replace('.', ',')} anos`}
          </p>
        </div>
        {puedeEditar && (
          <div className="flex flex-wrap gap-2">
            <Link href={`/pacientes/${paciente.id}/privacidad`} className="boton-secundario">
              <IconoCandado className="h-4 w-4" />
              Datos
            </Link>
            <Link href={`/pacientes/${paciente.id}/compartir`} className="boton-secundario">
              <IconoCompartir className="h-4 w-4" />
              Compartir
            </Link>
            <Link href={`/pacientes/${paciente.id}/carnet`} className="boton-secundario">
              <IconoImprimir className="h-4 w-4" />
              Carnet
            </Link>
            <Link href={`/pacientes/${paciente.id}/controles/nuevo`} className="boton-magenta">
              <IconoMas className="h-4 w-4" />
              Nuevo control
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {vencidos.length > 0 && (
          <Aviso nivel="alerta" titulo={`${vencidos.length} control${vencidos.length > 1 ? 'es' : ''} vencido${vencidos.length > 1 ? 's' : ''}`}>
            {vencidos.map((c) => `${c.label} (${fechaCorta(c.dueDate)})`).join(' · ')}
          </Aviso>
        )}
        {ultimo?.avisoAxial && (
          <Aviso nivel={ultimo.avisoAxial.nivel}>{ultimo.avisoAxial.texto}</Aviso>
        )}
        {cambioDeEquipo && (
          <Aviso nivel="aviso" titulo="Cambio de equipo de biometría">
            Los dos controles comparados se midieron con equipos distintos. La diferencia puede no
            ser solo crecimiento del ojo.
          </Aviso>
        )}
      </div>

      {/* Crecimiento y adherencia, juntos. */}
      <section className="mt-5">
        <h2 className="font-titulo text-lg">Crecimiento del ojo y uso del tratamiento</h2>
        {ultimo ? (
          <>
            <p className="text-sm text-grisTexto">
              Ultimo control: {fechaLarga(ultimo.examDate)}
              {ultimo.biometerNombre && ` · ${ultimo.biometerNombre}`}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <TarjetaSemaforo titulo="OD, 12 meses" semaforo={ultimo.semaforoOd} />
              <TarjetaSemaforo titulo="OI, 12 meses" semaforo={ultimo.semaforoOi} />
            </div>
            {(ultimo.entreControlesOd || ultimo.entreControlesOi) && (
              <p className="mt-2 text-xs text-grisTexto">
                Entre los dos ultimos controles:
                {ultimo.entreControlesOd &&
                  ` OD ${formatoMm(ultimo.entreControlesOd.mmPorAno)} mm/ano`}
                {ultimo.entreControlesOi &&
                  ` · OI ${formatoMm(ultimo.entreControlesOi.mmPorAno)} mm/ano`}
                {ultimo.entreControlesOd &&
                  ` (${ultimo.entreControlesOd.diasEntreControles} dias)`}
              </p>
            )}
            {textoConjunto && (
              <div className="mt-3">
                <Aviso nivel="aviso" titulo="Para conversar en la consulta">
                  {textoConjunto}
                  <NotaEducativa className="mt-1.5" />
                </Aviso>
              </div>
            )}
          </>
        ) : (
          <p className="mt-1 text-sm text-grisTexto">
            Todavía no hay controles registrados.
          </p>
        )}
      </section>

      {/* Adherencia por tratamiento activo */}
      {adherencia.length > 0 && (
        <section className="mt-6">
          <h2 className="font-titulo text-lg">Adherencia</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {adherencia.map((a) => (
              <div key={a.tratamiento.id} className="tarjeta">
                <div className="flex items-center gap-2">
                  <IconoTratamiento
                    tipo={a.tratamiento.type}
                    className="h-4 w-4"
                  />
                  <p className="font-semibold">{TRATAMIENTOS[a.tratamiento.type].nombre}</p>
                </div>
                <p className="mt-0.5 text-xs text-grisTexto">
                  Meta: {metaEnTexto({
                    id: a.tratamiento.id,
                    type: a.tratamiento.type,
                    startDate: a.tratamiento.startDate,
                    endDate: a.tratamiento.endDate,
                    adherenceGoal: a.tratamiento.adherenceGoal,
                  })}
                </p>
                <div className="mt-3 space-y-3">
                  <BarraAdherencia resumen={a.siete} titulo="7 dias" />
                  <BarraAdherencia resumen={a.treinta} titulo="30 dias" />
                  <BarraAdherencia resumen={a.noventa} titulo="90 dias" />
                </div>
                {a.treinta.diasConMolestias > 0 && (
                  <p className="mt-2 text-xs text-magenta">
                    {a.treinta.diasConMolestias} días con molestias en el último mes
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Registro del dia */}
      {tratamientosActivos.length > 0 && (
        <section className="mt-6">
          <h2 className="font-titulo text-lg">Registro de hoy</h2>
          <p className="text-sm text-grisTexto">{fechaLarga(hoy)}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
      )}

      {/* Graficas */}
      <section className="mt-6">
        <h2 className="font-titulo text-lg">Longitud axial</h2>
        <div className="tarjeta mt-3">
          <GraficaLongitudAxial datos={datosAxial} marcas={marcas} />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-titulo text-lg">Refracción</h2>
        <div className="tarjeta mt-3">
          <GraficaRefraccion
            datos={datosRefraccion}
            marcas={marcas.map((m) => ({ t: m.t, tipo: m.tipo }))}
          />
        </div>
      </section>

      {/* Tratamientos */}
      <section className="mt-6">
        <div className="flex items-center gap-3">
          <h2 className="font-titulo text-lg">Tratamientos</h2>
          {puedeEditar && (
            <Link
              href={`/pacientes/${paciente.id}/tratamientos/nuevo`}
              className="ml-auto text-sm text-azul hover:underline"
            >
              Agregar tratamiento
            </Link>
          )}
        </div>
        <div className="mt-3 space-y-2">
          {tratamientos.length === 0 && (
            <p className="text-sm text-grisTexto">Sin tratamientos registrados.</p>
          )}
          {tratamientos.map((t) => {
            const activo = !t.endDate || t.endDate >= hoy
            const d = TRATAMIENTOS[t.type]
            return (
              <div
                key={t.id}
                className="tarjeta border-l-4"
                style={{ borderLeftColor: d.color }}
              >
                <div className="flex flex-wrap items-start gap-2">
                  <IconoTratamiento tipo={t.type} className="mt-0.5 h-5 w-5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {d.nombre}
                      {t.concentration && ` ${t.concentration}`}
                    </p>
                    <p className="text-sm text-grisTexto">
                      Desde {fechaCorta(t.startDate)}
                      {t.endDate ? ` hasta ${fechaCorta(t.endDate)}` : ' · activo'}
                      {t.deviceLabel && ` · ${t.deviceLabel}`}
                    </p>
                    {t.changeReason && (
                      <p className="mt-0.5 text-sm text-grisMedio">
                        Motivo de cambio: {t.changeReason}
                      </p>
                    )}
                  </div>
                  {activo && puedeEditar && (
                    <form action={terminarTratamiento.bind(null, paciente.id)} className="flex items-end gap-1.5">
                      <input type="hidden" name="treatmentId" value={t.id} />
                      <input
                        type="date"
                        name="endDate"
                        defaultValue={hoy}
                        className="campo w-auto py-1.5 text-sm"
                        aria-label="Fecha de fin"
                      />
                      <input
                        type="text"
                        name="changeReason"
                        placeholder="Motivo"
                        className="campo w-32 py-1.5 text-sm"
                        aria-label="Motivo del cambio"
                      />
                      <button type="submit" className="boton-secundario py-1.5 text-sm">
                        Terminar
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Proximos controles */}
      <section className="mt-6">
        <h2 className="font-titulo text-lg">Próximos controles</h2>
        <div className="tarjeta mt-3">
          {citas.filter((c) => c.estadoVigente !== 'cumplida' && c.estadoVigente !== 'omitida')
            .length === 0 ? (
            <p className="text-sm text-grisTexto">No hay controles programados.</p>
          ) : (
            <ul className="divide-y divide-borde/60 text-sm">
              {[...vencidos, ...proximas].map((c) => (
                <li key={c.id} className="flex items-center gap-2 py-2 first:pt-0 last:pb-0">
                  <IconoCalendario
                    className={`h-4 w-4 shrink-0 ${c.estadoVigente === 'vencida' ? 'text-magenta' : 'text-grisTexto'}`}
                  />
                  <span className="min-w-0 flex-1 truncate">{c.label}</span>
                  <span className="shrink-0 tabular-nums text-grisTexto">
                    {fechaCorta(c.dueDate)}
                  </span>
                  <span
                    className={`shrink-0 text-xs font-semibold ${c.estadoVigente === 'vencida' ? 'text-magenta' : 'text-grisTexto'}`}
                  >
                    {etiquetaEstado(c.estadoVigente)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Tabla de controles */}
      <section className="mt-6">
        <h2 className="font-titulo text-lg">Controles</h2>
        <TablaControles controles={controles} />
      </section>
    </>
  )
}
