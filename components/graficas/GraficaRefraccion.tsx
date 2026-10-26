'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { COLORES } from '@/config/sitio'
import { TRATAMIENTOS, type TipoTratamiento } from '@/config/tratamientos'
import { fechaCorta } from '@/lib/clinica/edad'
import { formatoDioptrias } from '@/lib/clinica/refraccion'

export interface PuntoRefraccion {
  fecha: string
  t: number
  od: number | null
  oi: number | null
}

const SERIES = [
  { clave: 'od' as const, nombre: 'OD', color: COLORES.azul },
  { clave: 'oi' as const, nombre: 'OI', color: COLORES.magenta },
]

function Globo({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const punto: PuntoRefraccion = payload[0].payload
  return (
    <div className="rounded-mml border border-borde bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-tinta">{fechaCorta(punto.fecha)}</p>
      <div className="mt-1.5 space-y-0.5">
        {SERIES.map((s) => {
          const v = punto[s.clave]
          if (v === null) return null
          return (
            <p key={s.clave} className="flex items-center gap-1.5 text-grisMedio">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.nombre}
              <span className="ml-1 font-semibold tabular-nums text-tinta">
                {formatoDioptrias(v)} D
              </span>
            </p>
          )
        })}
      </div>
    </div>
  )
}

/** Equivalente esferico bajo cicloplejia, por ojo. */
export function GraficaRefraccion({
  datos,
  marcas,
}: {
  datos: PuntoRefraccion[]
  marcas: { t: number; tipo: TipoTratamiento }[]
}) {
  const valores = datos.flatMap((d) => [d.od, d.oi]).filter((v): v is number => v !== null)
  if (valores.length < 2) {
    return (
      <div className="rounded-mml border border-dashed border-borde px-4 py-8 text-center text-sm text-grisTexto">
        La gráfica aparece cuando haya al menos dos refracciones registradas.
      </div>
    )
  }

  const min = Math.min(...valores, 0)
  const max = Math.max(...valores, 0)
  const margen = Math.max(0.5, (max - min) * 0.2)
  const ultimo = datos[datos.length - 1]

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        {SERIES.map((s) => (
          <span
            key={s.clave}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-grisMedio"
          >
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.nombre}
          </span>
        ))}
        <span className="text-xs text-grisTexto">Equivalente esférico bajo cicloplejía</span>
      </div>

      <div className="h-56 w-full sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datos} margin={{ top: 10, right: 20, bottom: 4, left: -8 }}>
            <CartesianGrid stroke="#ddd6c8" strokeOpacity={0.6} vertical={false} />
            <ReferenceLine y={0} stroke="#ddd6c8" />
            {marcas.map((m, i) => (
              <ReferenceLine
                key={i}
                x={m.t}
                stroke={TRATAMIENTOS[m.tipo].color}
                strokeDasharray="3 3"
                strokeOpacity={0.6}
              />
            ))}
            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(t) => fechaCorta(new Date(t))}
              tick={{ fill: '#5b6570', fontSize: 11 }}
              stroke="#ddd6c8"
              tickLine={false}
              minTickGap={28}
            />
            <YAxis
              domain={[min - margen, max + margen]}
              tick={{ fill: '#5b6570', fontSize: 11 }}
              stroke="#ddd6c8"
              tickLine={false}
              axisLine={false}
              width={52}
              tickFormatter={(v: number) => formatoDioptrias(v)}
            />
            <Tooltip content={<Globo />} cursor={{ stroke: '#ddd6c8', strokeWidth: 1 }} />
            {SERIES.map((s) => (
              <Line
                key={s.clave}
                type="monotone"
                dataKey={s.clave}
                name={s.nombre}
                stroke={s.color}
                strokeWidth={2}
                connectNulls
                dot={{ r: 4, fill: s.color, stroke: COLORES.crema, strokeWidth: 2 }}
                activeDot={{ r: 6, fill: s.color, stroke: COLORES.crema, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-xs text-grisMedio">
        {SERIES.map((s) => {
          const v = ultimo[s.clave]
          if (v === null) return null
          return (
            <span key={s.clave} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              Último {s.nombre}
              <strong className="tabular-nums text-tinta">{formatoDioptrias(v)} D</strong>
            </span>
          )
        })}
      </div>
    </div>
  )
}
