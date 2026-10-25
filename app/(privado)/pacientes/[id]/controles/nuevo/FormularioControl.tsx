'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import Link from 'next/link'

import { crearControl } from '../../../acciones'
import { Area, BotonEnviar, Campo, Seccion, Selector, Texto } from '@/components/ui/Campo'
import { Aviso } from '@/components/ui/Aviso'
import { IconoTratamiento } from '@/components/marca/IconosTratamiento'
import { TRATAMIENTOS, type TipoTratamiento } from '@/config/tratamientos'
import { equivalenteEsferico, formatoDioptrias } from '@/lib/clinica/refraccion'
import type { ResultadoAccion } from '@/lib/validacion/esquemas'

export interface TratamientoActivo {
  id: string
  type: TipoTratamiento
  deviceLabel: string | null
  concentration: string | null
}

export interface EquipoBiometria {
  id: string
  name: string
}

/**
 * Formulario de control, pensado para llenarse en consulta en menos de dos
 * minutos: una columna por ojo, el equivalente esferico se calcula solo y los
 * hallazgos que aparecen son los del tratamiento activo.
 */
export function FormularioControl({
  patientId,
  hoy,
  equipos,
  equipoUltimo,
  tratamientosActivos,
}: {
  patientId: string
  hoy: string
  equipos: EquipoBiometria[]
  equipoUltimo: string | null
  tratamientosActivos: TratamientoActivo[]
}) {
  const accionConPaciente = crearControl.bind(null, patientId)
  const [estado, accion] = useFormState<ResultadoAccion | null, FormData>(accionConPaciente, null)
  const e = estado && !estado.ok ? (estado.campos ?? {}) : {}

  const [esfOd, setEsfOd] = useState('')
  const [cilOd, setCilOd] = useState('')
  const [esfOi, setEsfOi] = useState('')
  const [cilOi, setCilOi] = useState('')
  const [equipo, setEquipo] = useState(equipoUltimo ?? '')

  const eeOd = equivalenteEsferico(esfOd, cilOd)
  const eeOi = equivalenteEsferico(esfOi, cilOi)
  const cambioEquipo = equipoUltimo !== null && equipo !== '' && equipo !== equipoUltimo

  return (
    <form action={accion} className="space-y-4">
      {estado && !estado.ok && <Aviso nivel="alerta">{estado.error}</Aviso>}

      <Seccion titulo="Control">
        <Campo etiqueta="Fecha" nombre="examDate" error={e.examDate} requerido>
          <Texto nombre="examDate" type="date" defaultValue={hoy} error={e.examDate} required />
        </Campo>
        <Campo etiqueta="Tipo" nombre="examType">
          <Selector
            nombre="examType"
            defaultValue="rutina"
            opciones={[
              { valor: 'rutina', texto: 'Control de rutina' },
              { valor: 'inicio', texto: 'Control de inicio' },
              { valor: 'urgencia', texto: 'Consulta por molestia o urgencia' },
            ]}
          />
        </Campo>
      </Seccion>

      <section className="tarjeta">
        <h2 className="font-titulo text-lg">Agudeza visual y refraccion</h2>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="cycloplegic"
            defaultChecked
            className="h-4 w-4 accent-[#1fa3dd]"
          />
          Refraccion bajo cicloplejia
        </label>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-grisTexto">
                <th className="pb-1.5 pr-2 font-semibold">Ojo</th>
                <th className="pb-1.5 pr-2 font-semibold">AV</th>
                <th className="pb-1.5 pr-2 font-semibold">Esfera</th>
                <th className="pb-1.5 pr-2 font-semibold">Cilindro</th>
                <th className="pb-1.5 pr-2 font-semibold">Eje</th>
                <th className="pb-1.5 pr-2 font-semibold">EE</th>
                <th className="pb-1.5 font-semibold">Long. axial (mm)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1 pr-2 font-semibold">OD</td>
                <td className="py-1 pr-2">
                  <Texto nombre="vaOd" placeholder="20/20" className="py-1.5" />
                </td>
                <td className="py-1 pr-2">
                  <Texto
                    nombre="sphereOd"
                    inputMode="decimal"
                    placeholder="-3,00"
                    value={esfOd}
                    onChange={(ev) => setEsfOd(ev.target.value)}
                    error={e.sphereOd}
                    className="py-1.5"
                  />
                </td>
                <td className="py-1 pr-2">
                  <Texto
                    nombre="cylOd"
                    inputMode="decimal"
                    placeholder="-0,50"
                    value={cilOd}
                    onChange={(ev) => setCilOd(ev.target.value)}
                    className="py-1.5"
                  />
                </td>
                <td className="py-1 pr-2">
                  <Texto nombre="axisOd" inputMode="numeric" placeholder="180" className="py-1.5" />
                </td>
                <td className="py-1 pr-2 tabular-nums text-grisMedio">
                  {eeOd === null ? '-' : formatoDioptrias(eeOd)}
                </td>
                <td className="py-1">
                  <Texto
                    nombre="alOd"
                    inputMode="decimal"
                    placeholder="24,15"
                    error={e.alOd}
                    className="py-1.5"
                  />
                </td>
              </tr>
              <tr>
                <td className="py-1 pr-2 font-semibold">OI</td>
                <td className="py-1 pr-2">
                  <Texto nombre="vaOi" placeholder="20/20" className="py-1.5" />
                </td>
                <td className="py-1 pr-2">
                  <Texto
                    nombre="sphereOi"
                    inputMode="decimal"
                    placeholder="-3,00"
                    value={esfOi}
                    onChange={(ev) => setEsfOi(ev.target.value)}
                    error={e.sphereOi}
                    className="py-1.5"
                  />
                </td>
                <td className="py-1 pr-2">
                  <Texto
                    nombre="cylOi"
                    inputMode="decimal"
                    placeholder="-0,50"
                    value={cilOi}
                    onChange={(ev) => setCilOi(ev.target.value)}
                    className="py-1.5"
                  />
                </td>
                <td className="py-1 pr-2">
                  <Texto nombre="axisOi" inputMode="numeric" placeholder="180" className="py-1.5" />
                </td>
                <td className="py-1 pr-2 tabular-nums text-grisMedio">
                  {eeOi === null ? '-' : formatoDioptrias(eeOi)}
                </td>
                <td className="py-1">
                  <Texto
                    nombre="alOi"
                    inputMode="decimal"
                    placeholder="24,15"
                    error={e.alOi}
                    className="py-1.5"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Campo
            etiqueta="Notacion de agudeza visual"
            nombre="vaNotation"
          >
            <Selector
              nombre="vaNotation"
              defaultValue="snellen_20"
              opciones={[
                { valor: 'snellen_20', texto: 'Snellen 20/x' },
                { valor: 'snellen_6', texto: 'Snellen 6/x' },
                { valor: 'logmar', texto: 'logMAR' },
                { valor: 'decimal', texto: 'Decimal' },
              ]}
            />
          </Campo>
          <Campo
            etiqueta="Equipo de biometria"
            nombre="biometerId"
            error={e.biometerId}
            ayuda="Obligatorio si registra longitud axial. Compare siempre con el mismo equipo."
          >
            <Selector
              nombre="biometerId"
              value={equipo}
              onChange={(ev) => setEquipo(ev.target.value)}
              error={e.biometerId}
              opciones={[
                { valor: '', texto: 'Sin equipo' },
                ...equipos.map((q) => ({ valor: q.id, texto: q.name })),
              ]}
            />
          </Campo>
        </div>

        {equipos.length === 0 && (
          <div className="mt-3">
            <Aviso nivel="aviso">
              No hay equipos de biometria registrados.{' '}
              <Link href="/ajustes/equipos" className="underline">
                Agregue el suyo
              </Link>{' '}
              para poder guardar la longitud axial.
            </Aviso>
          </div>
        )}

        {cambioEquipo && (
          <div className="mt-3">
            <Aviso nivel="aviso" titulo="Equipo distinto al del control anterior">
              La comparacion de longitud axial entre equipos distintos puede no reflejar solo el
              crecimiento del ojo. Quedara marcado en la ficha.
            </Aviso>
          </div>
        )}
      </section>

      {tratamientosActivos.length > 0 && (
        <section className="tarjeta">
          <h2 className="font-titulo text-lg">Hallazgos del tratamiento</h2>
          <div className="mt-3 space-y-4">
            {tratamientosActivos.map((t) => {
              const d = TRATAMIENTOS[t.type]
              return (
                <div key={t.id}>
                  <div className="flex items-center gap-2">
                    <IconoTratamiento tipo={t.type} className="h-4 w-4" />
                    <p className="font-semibold" style={{ color: d.color }}>
                      {d.nombre}
                      {t.concentration && ` ${t.concentration}`}
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs leading-snug text-grisTexto">{d.queRevisar}</p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {d.hallazgos.map((h) => (
                      <Campo
                        key={h.clave}
                        etiqueta={h.etiqueta}
                        nombre={`hallazgo_${t.id}_${h.clave}`}
                      >
                        <Texto
                          nombre={`hallazgo_${t.id}_${h.clave}`}
                          inputMode={h.tipo === 'numero' ? 'decimal' : undefined}
                        />
                      </Campo>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <Seccion
        titulo="Uso y habitos"
        descripcion="Lo que reporta la familia en la consulta. El registro diario se lleva aparte."
      >
        <Campo etiqueta="Horas de uso al dia" nombre="reportedHoursPerDay">
          <Texto nombre="reportedHoursPerDay" inputMode="decimal" />
        </Campo>
        <Campo etiqueta="Horas al aire libre al dia" nombre="outdoorHoursPerDay">
          <Texto nombre="outdoorHoursPerDay" inputMode="decimal" />
        </Campo>
        <Campo etiqueta="Horas de pantalla al dia" nombre="screenHoursPerDay">
          <Texto nombre="screenHoursPerDay" inputMode="decimal" />
        </Campo>
      </Seccion>

      <Seccion titulo="Molestias, decision y proximo control">
        <div className="sm:col-span-2">
          <Campo etiqueta="Molestias o eventos" nombre="adverseEvents">
            <Area nombre="adverseEvents" rows={2} />
          </Campo>
        </div>
        <div className="sm:col-span-2">
          <Campo etiqueta="Decision" nombre="decision">
            <Area nombre="decision" rows={2} />
          </Campo>
        </div>
        <Campo etiqueta="Fecha del proximo control" nombre="nextExamDate">
          <Texto nombre="nextExamDate" type="date" />
        </Campo>
        <div className="flex items-end">
          <label className="flex items-center gap-2 pb-2.5 text-sm">
            <input type="checkbox" name="fundusDone" className="h-4 w-4 accent-[#5a9a3a]" />
            Se hizo examen de fondo de ojo
          </label>
        </div>
      </Seccion>

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <BotonEnviar className="boton-magenta sm:w-auto sm:px-8">Guardar control</BotonEnviar>
        <Link href={`/pacientes/${patientId}`} className="boton-secundario sm:w-auto">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
