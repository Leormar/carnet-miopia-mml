/**
 * Tabla de controles del carnet. La usan la ficha del profesional y la vista
 * de solo lectura del enlace, para que las dos muestren exactamente lo mismo.
 */

import type { Ficha } from '@/lib/datos/pacientes'
import { fechaCorta } from '@/lib/clinica/edad'
import { formatoRefraccion } from '@/lib/clinica/refraccion'
import { formatoMm } from '@/lib/clinica/crecimiento'

export function TablaControles({ controles }: { controles: Ficha['controles'] }) {
  return (
    <div className="tarjeta mt-3 overflow-x-auto p-0">
      <table className="w-full min-w-[840px] text-left text-sm">
        <thead>
          <tr className="border-b border-borde bg-tinta text-xs uppercase tracking-wide text-white">
            <th className="px-3 py-2 font-semibold">Fecha</th>
            <th className="px-3 py-2 font-semibold">Edad</th>
            <th className="px-3 py-2 font-semibold">AV OD / OI</th>
            <th className="px-3 py-2 font-semibold">Refraccion OD</th>
            <th className="px-3 py-2 font-semibold">Refraccion OI</th>
            <th className="px-3 py-2 font-semibold">LA OD</th>
            <th className="px-3 py-2 font-semibold">LA OI</th>
            <th className="px-3 py-2 font-semibold">Crec. 12 m OD / OI</th>
            <th className="px-3 py-2 font-semibold">Equipo</th>
          </tr>
        </thead>
        <tbody>
          {controles.length === 0 && (
            <tr>
              <td colSpan={9} className="px-3 py-6 text-center text-grisTexto">
                Sin controles registrados.
              </td>
            </tr>
          )}
          {[...controles].reverse().map((c) => (
            <tr key={c.id} className="border-b border-borde/60 last:border-0">
              <td className="px-3 py-2 tabular-nums">{fechaCorta(c.examDate)}</td>
              <td className="px-3 py-2 tabular-nums">{c.edad}</td>
              <td className="px-3 py-2">
                {[c.vaOd, c.vaOi].filter(Boolean).join(' / ') || '-'}
              </td>
              <td className="px-3 py-2 tabular-nums">
                {formatoRefraccion(c.sphereOd, c.cylOd, c.axisOd) || '-'}
              </td>
              <td className="px-3 py-2 tabular-nums">
                {formatoRefraccion(c.sphereOi, c.cylOi, c.axisOi) || '-'}
              </td>
              <td className="px-3 py-2 tabular-nums">
                {c.alOd ? String(c.alOd).replace('.', ',') : '-'}
              </td>
              <td className="px-3 py-2 tabular-nums">
                {c.alOi ? String(c.alOi).replace('.', ',') : '-'}
              </td>
              <td className="px-3 py-2 tabular-nums">
                {c.doceMesesOd || c.doceMesesOi
                  ? `${c.doceMesesOd ? formatoMm(c.doceMesesOd.mmPorAno) : '-'} / ${c.doceMesesOi ? formatoMm(c.doceMesesOi.mmPorAno) : '-'}`
                  : '-'}
              </td>
              <td className="px-3 py-2 text-xs text-grisTexto">{c.biometerNombre ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
