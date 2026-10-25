import type { TipoTratamiento } from '@/config/tratamientos'

type Props = { className?: string; strokeWidth?: number }

const base = (p: Props) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: p.strokeWidth ?? 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: p.className ?? 'h-5 w-5',
  'aria-hidden': true,
})

/** Montura de gafas. */
export function IconoGafas(p: Props) {
  return (
    <svg {...base(p)}>
      <circle cx="6" cy="14" r="3.5" />
      <circle cx="18" cy="14" r="3.5" />
      <path d="M9.5 14c.8-1 4.2-1 5 0" />
      <path d="M2.5 11.5 4 8.5a2 2 0 0 1 1.8-1.1h1" />
      <path d="M21.5 11.5 20 8.5a2 2 0 0 0-1.8-1.1h-1" />
    </svg>
  )
}

/** Lente de contacto blando sobre el ojo. */
export function IconoLentesBlandos(p: Props) {
  return (
    <svg {...base(p)}>
      <path d="M1.8 12S5.4 5.8 12 5.8 22.2 12 22.2 12 18.6 18.2 12 18.2 1.8 12 1.8 12Z" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M9.6 9.8a3.3 3.3 0 0 0 0 4.4" strokeDasharray="1.5 1.5" />
    </svg>
  )
}

/** Ortoqueratologia: lente nocturno, representado con la luna. */
export function IconoOrtok(p: Props) {
  return (
    <svg {...base(p)}>
      <path d="M2.2 12S5.6 6.4 12 6.4 21.8 12 21.8 12" />
      <circle cx="12" cy="12" r="3.4" />
      <path d="M2.2 12S5.6 17.6 12 17.6 21.8 12 21.8 12" />
      <path d="M19.2 3.4a2.9 2.9 0 1 0 2.4 2.4 2.3 2.3 0 0 1-2.4-2.4Z" />
    </svg>
  )
}

/** Gotero de atropina. */
export function IconoAtropina(p: Props) {
  return (
    <svg {...base(p)}>
      <path d="M10 2.5h4" />
      <path d="M11 2.5v3.2l-2.2 3A3.4 3.4 0 0 0 8.2 10.7v8.1a2.7 2.7 0 0 0 2.7 2.7h2.2a2.7 2.7 0 0 0 2.7-2.7v-8.1a3.4 3.4 0 0 0-.6-1.9l-2.2-3V2.5" />
      <path d="M8.2 13.4h7.6" />
      <path d="M19.6 5.2c.9 1.1 1.5 2 1.5 2.7a1.5 1.5 0 0 1-3 0c0-.7.6-1.6 1.5-2.7Z" />
    </svg>
  )
}

export function IconoTratamiento({
  tipo,
  className,
}: {
  tipo: TipoTratamiento
  className?: string
}) {
  switch (tipo) {
    case 'gafas':
      return <IconoGafas className={className} />
    case 'lentes_blandos':
      return <IconoLentesBlandos className={className} />
    case 'ortok':
      return <IconoOrtok className={className} />
    case 'atropina':
      return <IconoAtropina className={className} />
  }
}

/** Ojo, para la longitud axial. */
export function IconoOjo(p: Props) {
  return (
    <svg {...base(p)}>
      <path d="M1.8 12S5.4 5.8 12 5.8 22.2 12 22.2 12 18.6 18.2 12 18.2 1.8 12 1.8 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

/** Calendario, para los controles. */
export function IconoCalendario(p: Props) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}

/** Grafica de linea, para el crecimiento. */
export function IconoGrafica(p: Props) {
  return (
    <svg {...base(p)}>
      <path d="M3 3v18h18" />
      <path d="m7 15 4-5 3.2 3L20 6.5" />
    </svg>
  )
}

export function IconoAlerta(p: Props) {
  return (
    <svg {...base(p)}>
      <path d="M10.3 3.6 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  )
}

export function IconoVolver(p: Props) {
  return (
    <svg {...base(p)}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

export function IconoMas(p: Props) {
  return (
    <svg {...base(p)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconoImprimir(p: Props) {
  return (
    <svg {...base(p)}>
      <path d="M6 9V3h12v6" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="7" rx="1" />
    </svg>
  )
}

export function IconoCheck(p: Props) {
  return (
    <svg {...base(p)}>
      <path d="m20 6-11 11-5-5" />
    </svg>
  )
}
