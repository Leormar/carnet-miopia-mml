'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import Link from 'next/link'

import { crearTratamiento } from '../../../acciones'
import { Area, BotonEnviar, Campo, Seccion, Selector, Texto } from '@/components/ui/Campo'
import { Aviso } from '@/components/ui/Aviso'
import { IconoTratamiento } from '@/components/marca/IconosTratamiento'
import {
  CONCENTRACIONES_ATROPINA,
  ORDEN_TRATAMIENTOS,
  TRATAMIENTOS,
  type TipoTratamiento,
} from '@/config/tratamientos'
import { PLANTILLAS_BASE, plantillaPorDefecto } from '@/config/calendarios-control'
import { generarCalendario } from '@/lib/clinica/calendario'
import { fechaCorta } from '@/lib/clinica/edad'
import type { ResultadoAccion } from '@/lib/validacion/esquemas'

export function FormularioTratamiento({
  patientId,
  hoy,
}: {
  patientId: string
  hoy: string
}) {
  const accionConPaciente = crearTratamiento.bind(null, patientId)
  const [estado, accion] = useFormState<ResultadoAccion | null, FormData>(
    accionConPaciente,
    null,
  )
  const e = estado && !estado.ok ? (estado.campos ?? {}) : {}

  const [tipo, setTipo] = useState<TipoTratamiento>('ortok')
  const [inicio, setInicio] = useState(hoy)
  const [plantilla, setPlantilla] = useState(plantillaPorDefecto('ortok').clave)
  const [conCalendario, setConCalendario] = useState(true)

  const definicion = TRATAMIENTOS[tipo]
  const plantillasDelTipo = PLANTILLAS_BASE.filter((p) => p.tipo === tipo)
  const vistaPrevia = conCalendario
    ? generarCalendario(tipo, inicio, { claveePlantilla: plantilla, horizonteMeses: 24 })
    : []

  function cambiarTipo(nuevo: TipoTratamiento) {
    setTipo(nuevo)
    setPlantilla(plantillaPorDefecto(nuevo).clave)
  }

  return (
    <form action={accion} className="space-y-4">
      {estado && !estado.ok && <Aviso nivel="alerta">{estado.error}</Aviso>}

      <section className="tarjeta">
        <h2 className="font-titulo text-lg">Tipo de tratamiento</h2>
        <p className="mt-0.5 text-sm text-grisTexto">
          Para combinar tratamientos, por ejemplo orto-k más atropina, cree uno y luego el otro.
          Cada uno conserva su meta de uso y su calendario.
        </p>
        <input type="hidden" name="type" value={tipo} />
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {ORDEN_TRATAMIENTOS.map((t) => {
            const d = TRATAMIENTOS[t]
            const activo = tipo === t
            return (
              <button
                type="button"
                key={t}
                onClick={() => cambiarTipo(t)}
                className="flex items-start gap-2.5 rounded-mml border p-3 text-left transition"
                style={{
                  borderColor: activo ? d.color : '#ddd6c8',
                  background: activo ? `${d.color}10` : '#fff',
                  boxShadow: activo ? `inset 0 0 0 1px ${d.color}` : undefined,
                }}
              >
                <IconoTratamiento tipo={t} className="mt-0.5 h-5 w-5" />
                <span>
                  <span className="block font-semibold">{d.nombre}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-grisTexto">
                    {d.queRevisar}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <Seccion titulo="Dispositivo y fechas">
        <Campo
          etiqueta={tipo === 'atropina' ? 'Presentación' : 'Dispositivo'}
          nombre="deviceLabel"
          ayuda="Texto libre. No hay catalogo de marcas obligatorio"
        >
          <Texto
            nombre="deviceLabel"
            autoComplete="off"
            placeholder={
              tipo === 'ortok'
                ? 'Diseño y material del lente'
                : tipo === 'atropina'
                  ? 'Fórmula magistral, gotero'
                  : 'Diseño de la lente'
            }
          />
        </Campo>

        {tipo === 'atropina' && (
          <Campo etiqueta="Concentración" nombre="concentration">
            <Texto nombre="concentration" list="concentraciones" placeholder="0,01 %" />
            <datalist id="concentraciones">
              {CONCENTRACIONES_ATROPINA.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Campo>
        )}

        <Campo etiqueta="Fecha de inicio" nombre="startDate" error={e.startDate} requerido>
          <Texto
            nombre="startDate"
            type="date"
            value={inicio}
            onChange={(ev) => setInicio(ev.target.value)}
            error={e.startDate}
            required
          />
        </Campo>
        <Campo
          etiqueta="Fecha de fin"
          nombre="endDate"
          ayuda="Dejela vacía si el tratamiento esta activo"
        >
          <Texto nombre="endDate" type="date" />
        </Campo>
      </Seccion>

      <Seccion
        titulo="Meta de uso"
        descripcion={`Por defecto: ${textoMeta(tipo)}. Puede ajustarla para este niño.`}
      >
        {definicion.modoRegistro === 'horas' ? (
          <>
            <Campo etiqueta="Horas al día" nombre="metaHorasPorDia" error={e.metaHorasPorDia}>
              <Texto
                nombre="metaHorasPorDia"
                inputMode="decimal"
                defaultValue={definicion.metaPorDefecto.horasPorDia}
                error={e.metaHorasPorDia}
              />
            </Campo>
            <Campo etiqueta="Días por semana" nombre="metaDiasPorSemana">
              <Texto
                nombre="metaDiasPorSemana"
                inputMode="numeric"
                defaultValue={definicion.metaPorDefecto.diasPorSemana}
              />
            </Campo>
          </>
        ) : (
          <Campo
            etiqueta={definicion.modoRegistro === 'noche' ? 'Noches por semana' : 'Gotas por semana'}
            nombre="metaNochesPorSemana"
          >
            <Texto
              nombre="metaNochesPorSemana"
              inputMode="numeric"
              defaultValue={definicion.metaPorDefecto.nochesPorSemana}
            />
          </Campo>
        )}
      </Seccion>

      <section className="tarjeta">
        <h2 className="font-titulo text-lg">Calendario de controles</h2>
        <label className="mt-2 flex items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            name="generarCalendario"
            checked={conCalendario}
            onChange={(ev) => setConCalendario(ev.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#5a9a3a]"
          />
          <span className="leading-snug">
            Generar las citas de control al guardar, a 24 meses
          </span>
        </label>

        {conCalendario && (
          <>
            <div className="mt-3">
              <Campo etiqueta="Protocolo" nombre="calendarTemplateKey">
                <Selector
                  nombre="calendarTemplateKey"
                  value={plantilla}
                  onChange={(ev) => setPlantilla(ev.target.value)}
                  opciones={plantillasDelTipo.map((p) => ({ valor: p.clave, texto: p.nombre }))}
                />
              </Campo>
              <p className="ayuda">
                {PLANTILLAS_BASE.find((p) => p.clave === plantilla)?.fuente}
              </p>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-borde text-xs uppercase tracking-wide text-grisTexto">
                    <th className="py-1.5 pr-3 font-semibold">Control</th>
                    <th className="py-1.5 pr-3 font-semibold">Fecha</th>
                    <th className="py-1.5 font-semibold">Incluye</th>
                  </tr>
                </thead>
                <tbody>
                  {vistaPrevia.map((c, i) => (
                    <tr key={i} className="border-b border-borde/60 last:border-0">
                      <td className="py-1.5 pr-3">{c.label}</td>
                      <td className="py-1.5 pr-3 tabular-nums">{fechaCorta(c.dueDate)}</td>
                      <td className="py-1.5 text-xs text-grisTexto">
                        {[
                          c.requires.biometria && 'biometría',
                          c.requires.topografia && 'topografía',
                          c.requires.ciclopejia && 'ciclopléjica',
                          c.requires.fondoDeOjo && 'fondo de ojo',
                        ]
                          .filter(Boolean)
                          .join(' · ') || 'revisión'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <Seccion titulo="Notas">
        <div className="sm:col-span-2">
          <Campo etiqueta="Motivo del cambio u observaciones" nombre="notes">
            <Area nombre="notes" rows={3} />
          </Campo>
          <input type="hidden" name="changeReason" value="" />
        </div>
      </Seccion>

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <BotonEnviar className="boton-magenta sm:w-auto sm:px-8">Guardar tratamiento</BotonEnviar>
        <Link href={`/pacientes/${patientId}`} className="boton-secundario sm:w-auto">
          Cancelar
        </Link>
      </div>
    </form>
  )
}

function textoMeta(tipo: TipoTratamiento) {
  const m = TRATAMIENTOS[tipo].metaPorDefecto
  if (m.horasPorDia !== undefined) {
    return `${m.horasPorDia} horas al día, ${m.diasPorSemana ?? 7} días por semana`
  }
  return TRATAMIENTOS[tipo].modoRegistro === 'noche' ? 'todas las noches' : 'todas las noches'
}
