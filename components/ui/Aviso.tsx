import { IconoAlerta } from '@/components/marca/IconosTratamiento'

type Nivel = 'informativo' | 'aviso' | 'alerta'

const ESTILOS: Record<Nivel, string> = {
  informativo: 'bg-white border-borde text-grisMedio',
  aviso: 'bg-semAmarillo border-amarillo/40 text-tinta',
  alerta: 'bg-semRojo border-magenta/30 text-tinta',
}

export function Aviso({
  nivel = 'informativo',
  titulo,
  children,
}: {
  nivel?: Nivel
  titulo?: string
  children: React.ReactNode
}) {
  return (
    <div className={`flex gap-2.5 rounded-mml border px-3 py-2.5 text-sm ${ESTILOS[nivel]}`}>
      {nivel !== 'informativo' && <IconoAlerta className="mt-0.5 h-4 w-4 shrink-0" />}
      <div className="leading-snug">
        {titulo && <p className="font-semibold">{titulo}</p>}
        <div>{children}</div>
      </div>
    </div>
  )
}

/** Nota obligatoria al pie de todo texto de sugerencia. */
export function NotaEducativa({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs text-grisTexto ${className}`}>
      Este contenido es educativo y no reemplaza una valoracion visual individual.
    </p>
  )
}
