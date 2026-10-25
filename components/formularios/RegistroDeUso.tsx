'use client'

import { useState, useTransition } from 'react'

import { registrarUso } from '@/app/(privado)/pacientes/acciones'
import { TRATAMIENTOS, type TipoTratamiento } from '@/config/tratamientos'
import { IconoCheck, IconoTratamiento } from '@/components/marca/IconosTratamiento'

export interface TratamientoParaRegistro {
  id: string
  tipo: TipoTratamiento
  etiqueta: string | null
  metaTexto: string
}

export interface RegistroExistente {
  hours: number | null
  done: boolean | null
  outdoorMinutes: number | null
  discomfort: boolean
}

/**
 * Boton grande de "registrar hoy" para la familia. Un bloque por cada
 * tratamiento activo: orto-k y atropina se registran con si o no, gafas y
 * lentes blandos con las horas del dia.
 */
export function RegistroDeUso({
  patientId,
  tratamiento,
  fecha,
  existente,
}: {
  patientId: string
  tratamiento: TratamientoParaRegistro
  fecha: string
  existente: RegistroExistente | null
}) {
  const definicion = TRATAMIENTOS[tratamiento.tipo]
  const [pendiente, iniciar] = useTransition()
  const [guardado, setGuardado] = useState(false)
  const [horas, setHoras] = useState(existente?.hours != null ? String(existente.hours) : '')
  const [hecho, setHecho] = useState<boolean | null>(existente?.done ?? null)
  const [aireLibre, setAireLibre] = useState(
    existente?.outdoorMinutes != null ? String(existente.outdoorMinutes) : '',
  )
  const [molestia, setMolestia] = useState(existente?.discomfort ?? false)

  function enviar(valores: { done?: boolean | null; hours?: string }) {
    const datos = new FormData()
    datos.set('treatmentId', tratamiento.id)
    datos.set('logDate', fecha)
    const nuevasHoras = valores.hours ?? horas
    const nuevoHecho = valores.done !== undefined ? valores.done : hecho
    if (definicion.modoRegistro === 'horas') {
      datos.set('hours', nuevasHoras)
    } else if (nuevoHecho !== null) {
      datos.set('done', nuevoHecho ? 'si' : 'no')
    }
    if (aireLibre) datos.set('outdoorMinutes', aireLibre)
    if (molestia) datos.set('discomfort', 'on')

    iniciar(async () => {
      await registrarUso(patientId, datos)
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2500)
    })
  }

  return (
    <div
      className="rounded-xl border bg-white p-4"
      style={{ borderColor: `${definicion.color}55` }}
    >
      <div className="flex items-center gap-2">
        <IconoTratamiento tipo={tratamiento.tipo} className="h-5 w-5" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{definicion.nombre}</p>
          <p className="text-xs text-grisTexto">
            Meta: {tratamiento.metaTexto}
            {tratamiento.etiqueta && ` · ${tratamiento.etiqueta}`}
          </p>
        </div>
        {guardado && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-verde">
            <IconoCheck className="h-4 w-4" />
            Guardado
          </span>
        )}
      </div>

      <p className="mt-3 text-sm font-medium">{definicion.preguntaDiaria}</p>

      {definicion.modoRegistro === 'horas' ? (
        <div className="mt-2">
          <div className="flex flex-wrap gap-1.5">
            {[2, 4, 6, 8, 10, 12, 14].map((h) => (
              <button
                key={h}
                type="button"
                disabled={pendiente}
                onClick={() => {
                  setHoras(String(h))
                  enviar({ hours: String(h) })
                }}
                className="min-w-[44px] rounded-lg border px-3 py-2 text-sm font-semibold transition"
                style={
                  horas === String(h)
                    ? { background: definicion.color, color: '#fff', borderColor: definicion.color }
                    : { borderColor: '#ddd6c8', background: '#fff' }
                }
              >
                {h} h
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              inputMode="decimal"
              value={horas}
              onChange={(ev) => setHoras(ev.target.value)}
              placeholder="Otro numero de horas"
              className="campo flex-1"
            />
            <button
              type="button"
              disabled={pendiente}
              onClick={() => enviar({})}
              className="boton-secundario shrink-0"
            >
              Guardar
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={pendiente}
            onClick={() => {
              setHecho(true)
              enviar({ done: true })
            }}
            className="rounded-lg border py-3.5 text-base font-semibold transition"
            style={
              hecho === true
                ? { background: definicion.color, color: '#fff', borderColor: definicion.color }
                : { borderColor: '#ddd6c8', background: '#fff' }
            }
          >
            Si
          </button>
          <button
            type="button"
            disabled={pendiente}
            onClick={() => {
              setHecho(false)
              enviar({ done: false })
            }}
            className="rounded-lg border py-3.5 text-base font-semibold transition"
            style={
              hecho === false
                ? { background: '#111c26', color: '#fff', borderColor: '#111c26' }
                : { borderColor: '#ddd6c8', background: '#fff' }
            }
          >
            No
          </button>
        </div>
      )}

      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-medium text-azul">
          Agregar aire libre o molestias
        </summary>
        <div className="mt-2 space-y-2">
          <div>
            <label className="etiqueta text-xs" htmlFor={`aire-${tratamiento.id}`}>
              Minutos al aire libre
            </label>
            <input
              id={`aire-${tratamiento.id}`}
              inputMode="numeric"
              value={aireLibre}
              onChange={(ev) => setAireLibre(ev.target.value)}
              onBlur={() => enviar({})}
              className="campo"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={molestia}
              onChange={(ev) => {
                setMolestia(ev.target.checked)
                setTimeout(() => enviar({}), 0)
              }}
              className="h-4 w-4 accent-[#e2104f]"
            />
            Hubo molestias hoy
          </label>
        </div>
      </details>
    </div>
  )
}
