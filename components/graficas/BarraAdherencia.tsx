import type { ResumenAdherencia } from '@/lib/clinica/adherencia'
import { nivelAdherencia } from '@/lib/clinica/adherencia'

const COLOR = {
  alta: '#5a9a3a',
  media: '#f5c400',
  baja: '#e2104f',
  sin_dato: '#ddd6c8',
}

export function BarraAdherencia({
  resumen,
  titulo,
}: {
  resumen: ResumenAdherencia
  titulo: string
}) {
  const nivel = nivelAdherencia(resumen.porcentaje)
  const color = COLOR[nivel]
  const pct = resumen.porcentaje ?? 0

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-grisTexto">
          {titulo}
        </span>
        <span className="font-titulo text-lg tabular-nums" style={{ color }}>
          {resumen.porcentaje === null ? 'Sin dato' : `${resumen.porcentaje} %`}
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-borde/50">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <p className="mt-1 text-xs text-grisTexto">
        {resumen.diasCumplidos} de {resumen.diasActivos} días
        {resumen.diasSinRegistro > 0 && ` · ${resumen.diasSinRegistro} sin registrar`}
        {resumen.promedioHoras !== null &&
          ` · promedio ${String(resumen.promedioHoras).replace('.', ',')} h`}
      </p>
    </div>
  )
}
