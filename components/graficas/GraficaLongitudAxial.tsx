'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { COLORES } from '@/config/sitio'
import { META_LONGITUD_AXIAL } from '@/config/umbrales-clinicos'
import { TRATAMIENTOS, type TipoTratamiento } from '@/config/tratamientos'
import { fechaCorta } from '@/lib/clinica/edad'

export interface PuntoAxial {
  fecha: string
  t: number
  od: number | null
  oi: number | null
  equipo: string | null
}

export interface MarcaTratamiento {
  t: number
  fecha: string
  tipo: TipoTratamiento
  etiqueta: string
}

/** OD azul, OI magenta. Validado para vision con deficiencia de color. */
const SERIES = [
  { clave: 'od' as const, nombre: 'OD', color: COLORES.azul },
  { clave: 'oi' as const, nombre: 'OI', color: COLORES.magenta },
]

function Etiqueta({ texto, color }: { texto: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-grisMedio">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {texto}
    </span>
  )
}

function Globo({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const punto: PuntoAxial = payload[0].payload
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
                {v.toFixed(2).replace('.', ',')} mm
              </span>
            </p>
          )
        })}
      </div>
      {punto.equipo && <p className="mt-1.5 text-grisTexto">Equipo: {punto.equipo}</p>}
    </div>
  )
}

export function GraficaLongitudAxial({
  datos,
  marcas,
}: {
  datos: PuntoAxial[]
  marcas: MarcaTratamiento[]
}) {
  const valores = datos.flatMap((d) => [d.od, d.oi]).filter((v): v is number => v !== null)
  if (valores.length < 2) {
    return (
      <div className="rounded-mml border border-dashed border-borde px-4 py-8 text-center text-sm text-grisTexto">
        La grafica aparece cuando haya al menos dos mediciones de longitud axial.
      </div>
    )
  }

  const min = Math.min(...valores)
  const max = Math.max(...valores)
  const margen = Math.max(0.15, (max - min) * 0.25)
  const yMin = Math.floor((min - margen) * 10) / 10
  const yMax = Math.ceil((max + margen) * 10) / 10
  const muestraMeta = yMax >= META_LONGITUD_AXIAL.limiteMm - 0.2

  const ultimo = datos[datos.length - 1]

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        {SERIES.map((s) => (
          <Etiqueta key={s.clave} texto={`${s.nombre} (ojo ${s.nombre === 'OD' ? 'derecho' : 'izquierdo'})`} color={s.color} />
        ))}
        {marcas.length > 0 && (
          <span className="text-xs text-grisTexto">
            Las lineas verticales marcan el inicio de cada tratamiento
          </span>
        )}
      </div>

      <div className="h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datos} margin={{ top: 10, right: 44, bottom: 4, left: -8 }}>
            <CartesianGrid stroke="#ddd6c8" strokeOpacity={0.6} vertical={false} />

            {muestraMeta && (
              <>
                <ReferenceArea
                  y1={META_LONGITUD_AXIAL.limiteMm}
                  y2={yMax}
                  fill={COLORES.magenta}
                  fillOpacity={0.05}
                />
                <ReferenceLine
                  y={META_LONGITUD_AXIAL.limiteMm}
                  stroke={COLORES.magenta}
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={{
                    value: `Meta ${META_LONGITUD_AXIAL.limiteMm} mm`,
                    position: 'insideTopRight',
                    fill: '#5b6570',
                    fontSize: 10,
                  }}
                />
              </>
            )}

            {marcas.map((m, i) => (
              <ReferenceLine
                key={i}
                x={m.t}
                stroke={TRATAMIENTOS[m.tipo].color}
                strokeDasharray="3 3"
                strokeOpacity={0.75}
                label={{
                  value: TRATAMIENTOS[m.tipo].nombreCorto,
                  position: 'top',
                  fill: TRATAMIENTOS[m.tipo].color,
                  fontSize: 10,
                  fontWeight: 600,
                }}
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
              domain={[yMin, yMax]}
              tick={{ fill: '#5b6570', fontSize: 11 }}
              stroke="#ddd6c8"
              tickLine={false}
              axisLine={false}
              width={46}
              tickFormatter={(v: number) => v.toFixed(1).replace('.', ',')}
              label={{
                value: 'mm',
                position: 'insideTopLeft',
                fill: '#5b6570',
                fontSize: 10,
                offset: 8,
              }}
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

      {/* Etiqueta directa del ultimo valor: el azul no alcanza 3:1 contra el fondo,
          asi que la identidad nunca queda solo en el color. */}
      <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-xs text-grisMedio">
        {SERIES.map((s) => {
          const v = ultimo[s.clave]
          if (v === null) return null
          return (
            <span key={s.clave} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              Ultimo {s.nombre}
              <strong className="tabular-nums text-tinta">
                {v.toFixed(2).replace('.', ',')} mm
              </strong>
            </span>
          )
        })}
      </div>
    </div>
  )
}
