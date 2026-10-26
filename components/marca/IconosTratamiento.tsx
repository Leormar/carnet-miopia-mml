import type { TipoTratamiento } from '@/config/tratamientos'

type Props = { className?: string; strokeWidth?: number }

/**
 * Iconos de la aplicacion, a dos tonos: un relleno suave del mismo color mas
 * el trazo. El trazo solo, a 14 px, se lee como un garabato generico; con el
 * relleno la silueta se reconoce de un vistazo, que es para lo que sirven.
 *
 * Todos toman el color de `currentColor`, asi que una pastilla de tratamiento
 * o un boton los tine sin tocar el dibujo. Para los banners de la portada hay
 * ilustraciones grandes aparte, en IlustracionTratamiento.
 */

const base = (p: Props) => ({
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor' as const,
  strokeWidth: p.strokeWidth ?? 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: p.className ?? 'h-5 w-5',
  'aria-hidden': true,
})

/** Relleno del mismo color, discreto: da cuerpo sin ensuciar. */
const RELLENO = { fill: 'currentColor', fillOpacity: 0.16, stroke: 'none' } as const
const SOLIDO = { fill: 'currentColor', stroke: 'none' } as const

/** Montura de gafas, con las zonas de tratamiento del lente. */
export function IconoGafas(p: Props) {
  return (
    <svg {...base(p)}>
      <circle cx="6" cy="14" r="4" {...RELLENO} />
      <circle cx="18" cy="14" r="4" {...RELLENO} />
      <circle cx="6" cy="14" r="4" />
      <circle cx="18" cy="14" r="4" />
      <circle cx="6" cy="14" r="1.5" opacity="0.55" strokeWidth="1.1" />
      <circle cx="18" cy="14" r="1.5" opacity="0.55" strokeWidth="1.1" />
      <path d="M10 13.6c.9-.8 3.1-.8 4 0" />
      <path d="M2.2 11.6 3.6 9a2 2 0 0 1 1.8-1h.8" />
      <path d="M21.8 11.6 20.4 9a2 2 0 0 0-1.8-1h-.8" />
    </svg>
  )
}

/** Lente de contacto blando, con sus anillos de enfoque. */
export function IconoLentesBlandos(p: Props) {
  return (
    <svg {...base(p)}>
      <ellipse cx="12" cy="13.5" rx="9" ry="6.5" {...RELLENO} />
      <ellipse cx="12" cy="13.5" rx="9" ry="6.5" />
      <ellipse cx="12" cy="13.5" rx="4.6" ry="3.2" opacity="0.6" strokeWidth="1.2" />
      <path d="M3 13.5C3 8.8 7 5 12 5s9 3.8 9 8.5" />
    </svg>
  )
}

/** Ortoqueratologia: el lente que se usa de noche sobre la cornea. */
export function IconoOrtok(p: Props) {
  return (
    <svg {...base(p)}>
      <path d="M2.5 17.5C2.5 11.7 6.8 7.5 12 7.5s9.5 4.2 9.5 10Z" {...RELLENO} />
      <path d="M2.5 17.5C2.5 11.7 6.8 7.5 12 7.5s9.5 4.2 9.5 10" />
      <path d="M2.5 17.5h19" opacity="0.45" strokeWidth="1.3" />
      <path d="M5.8 14.6C7.3 12.6 9.5 11.4 12 11.4s4.7 1.2 6.2 3.2" opacity="0.7" strokeWidth="1.3" />
      <path d="M19.4 2.2a2.7 2.7 0 1 0 2.3 2.3 2.1 2.1 0 0 1-2.3-2.3Z" {...SOLIDO} />
    </svg>
  )
}

/** Frasco de atropina y su gota. */
export function IconoAtropina(p: Props) {
  return (
    <svg {...base(p)}>
      <rect x="9.2" y="1.8" width="5.6" height="2.6" rx="0.8" {...SOLIDO} />
      <path d="M8.6 10.2a3.4 3.4 0 0 1 1.9-3V4.4h3v2.8a3.4 3.4 0 0 1 1.9 3v9.1a2.7 2.7 0 0 1-2.7 2.7h-1.4a2.7 2.7 0 0 1-2.7-2.7Z" {...RELLENO} />
      <path d="M8.6 10.2a3.4 3.4 0 0 1 1.9-3V4.4h3v2.8a3.4 3.4 0 0 1 1.9 3v9.1a2.7 2.7 0 0 1-2.7 2.7h-1.4a2.7 2.7 0 0 1-2.7-2.7Z" />
      <path d="M8.6 13.6h6.8" opacity="0.5" strokeWidth="1.2" />
      <path d="M19.9 5.1c1 1.3 1.6 2.2 1.6 2.9a1.6 1.6 0 0 1-3.2 0c0-.7.6-1.6 1.6-2.9Z" {...SOLIDO} />
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
      <path d="M1.8 12S5.4 5.8 12 5.8 22.2 12 22.2 12 18.6 18.2 12 18.2 1.8 12 1.8 12Z" {...RELLENO} />
      <path d="M1.8 12S5.4 5.8 12 5.8 22.2 12 22.2 12 18.6 18.2 12 18.2 1.8 12 1.8 12Z" />
      <circle cx="12" cy="12" r="3.1" {...SOLIDO} />
      <circle cx="13.1" cy="10.9" r="0.9" fill="#fff" stroke="none" opacity="0.85" />
    </svg>
  )
}

/** Calendario, para los controles. */
export function IconoCalendario(p: Props) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" {...RELLENO} />
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18" />
      <path d="M8 2.8v4M16 2.8v4" />
      <circle cx="8.5" cy="14.5" r="1.3" {...SOLIDO} />
      <circle cx="12" cy="14.5" r="1.3" {...SOLIDO} />
      <circle cx="8.5" cy="18" r="1.3" {...SOLIDO} opacity="0.45" />
    </svg>
  )
}

/** Grafica de linea, para el crecimiento. */
export function IconoGrafica(p: Props) {
  return (
    <svg {...base(p)}>
      <path d="M3.5 21V9.5l3.5-1 3.5 3 3.5-4.5 3.5 2 3-3.5V21Z" {...RELLENO} />
      <path d="M3 3v18h18" />
      <path d="m7 15.5 4-5 3.2 3L20 6.5" />
      <circle cx="20" cy="6.5" r="1.8" {...SOLIDO} />
    </svg>
  )
}

export function IconoAlerta(p: Props) {
  return (
    <svg {...base(p)}>
      <path d="M10.3 3.6 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" {...RELLENO} />
      <path d="M10.3 3.6 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4.5" />
      <circle cx="12" cy="17.2" r="1.1" {...SOLIDO} />
    </svg>
  )
}

export function IconoVolver(p: Props) {
  return (
    <svg {...base(p)} strokeWidth={p.strokeWidth ?? 2}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

export function IconoMas(p: Props) {
  return (
    <svg {...base(p)} strokeWidth={p.strokeWidth ?? 2.2}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconoImprimir(p: Props) {
  return (
    <svg {...base(p)}>
      <path d="M6 9V3h12v6" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" {...RELLENO} />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <circle cx="18.5" cy="12.5" r="1" {...SOLIDO} />
      <rect x="6" y="14" width="12" height="7" rx="1.2" fill="#fff" />
      <rect x="6" y="14" width="12" height="7" rx="1.2" />
      <path d="M9 17h6M9 19h4" opacity="0.55" strokeWidth="1.2" />
    </svg>
  )
}

export function IconoCheck(p: Props) {
  return (
    <svg {...base(p)} strokeWidth={p.strokeWidth ?? 2.2}>
      <path d="m20 6-11 11-5-5" />
    </svg>
  )
}

/** Tres nodos unidos: compartir. */
export function IconoCompartir(p: Props) {
  return (
    <svg {...base(p)}>
      <path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
      <circle cx="18" cy="5" r="2.6" {...SOLIDO} />
      <circle cx="6" cy="12" r="2.6" {...SOLIDO} />
      <circle cx="18" cy="19" r="2.6" {...SOLIDO} />
    </svg>
  )
}

/** Cuadricula de un codigo QR. */
export function IconoQr(p: Props) {
  return (
    <svg {...base(p)}>
      {[
        [3, 3],
        [14, 3],
        [3, 14],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="7" height="7" rx="1.4" {...RELLENO} />
          <rect x={x} y={y} width="7" height="7" rx="1.4" />
          <rect x={x + 2.4} y={y + 2.4} width="2.2" height="2.2" rx="0.5" {...SOLIDO} />
        </g>
      ))}
      <rect x="14" y="14" width="3" height="3" rx="0.6" {...SOLIDO} />
      <path d="M20 14v3M14 20h3M20 20h1" />
    </svg>
  )
}

/** Candado cerrado, para lo que es de solo lectura. */
export function IconoCandado(p: Props) {
  return (
    <svg {...base(p)}>
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <rect x="4" y="10" width="16" height="11" rx="2.5" {...RELLENO} />
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <circle cx="12" cy="15.5" r="1.4" {...SOLIDO} />
      <path d="M12 16.6v1.9" strokeWidth="1.6" />
    </svg>
  )
}

/** Triangulo de reproducir, dentro de su circulo. */
export function IconoReproducir(p: Props) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9.2" {...RELLENO} />
      <circle cx="12" cy="12" r="9.2" />
      <path d="M10 8.6 16 12l-6 3.4Z" {...SOLIDO} />
    </svg>
  )
}
