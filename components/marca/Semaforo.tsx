import type { ColorSemaforo, Semaforo as TipoSemaforo } from '@/lib/clinica/crecimiento'

const ESTILOS: Record<ColorSemaforo, { fondo: string; punto: string; texto: string }> = {
  verde: { fondo: 'bg-semVerde', punto: 'bg-verde', texto: 'text-tinta' },
  amarillo: { fondo: 'bg-semAmarillo', punto: 'bg-amarillo', texto: 'text-tinta' },
  rojo: { fondo: 'bg-semRojo', punto: 'bg-magenta', texto: 'text-tinta' },
  sin_color: { fondo: 'bg-white border border-borde', punto: 'bg-borde', texto: 'text-grisTexto' },
}

/** Punto de color solo, para las filas del panel. */
export function PuntoSemaforo({ color, titulo }: { color: ColorSemaforo; titulo?: string }) {
  return (
    <span
      title={titulo}
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${ESTILOS[color].punto}`}
    />
  )
}

/** Tarjeta de semaforo con el valor y la lectura. */
export function TarjetaSemaforo({
  titulo,
  semaforo,
}: {
  titulo: string
  semaforo: TipoSemaforo
}) {
  const e = ESTILOS[semaforo.color]
  return (
    <div className={`rounded-mml px-3 py-2.5 ${e.fondo}`}>
      <div className="flex items-center gap-2">
        <PuntoSemaforo color={semaforo.color} />
        <span className="text-xs font-semibold uppercase tracking-wide text-grisTexto">
          {titulo}
        </span>
      </div>
      <div className={`mt-1 font-titulo text-xl ${e.texto}`}>{semaforo.etiqueta}</div>
      <p className="mt-0.5 text-xs leading-snug text-grisMedio">{semaforo.descripcion}</p>
      {semaforo.franja && (
        <p className="mt-1 text-[11px] text-grisTexto">Franja de {semaforo.franja}</p>
      )}
    </div>
  )
}
