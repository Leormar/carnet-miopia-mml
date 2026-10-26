import type { TipoTratamiento } from '@/config/tratamientos'

/**
 * Ilustraciones grandes de los cuatro tratamientos, para los banners de la
 * portada. A diferencia de los iconos pequenos, estas tienen relleno y peso:
 * se ven a distancia y aguantan un fondo de color.
 *
 * Cada una toma su color del tratamiento por `currentColor`, asi que una sola
 * pieza sirve para los cuatro sin repetir el dibujo.
 */

type Props = { className?: string }

const marco = (p: Props) => ({
  viewBox: '0 0 120 80',
  className: p.className ?? 'h-20 w-full',
  fill: 'none' as const,
  stroke: 'currentColor' as const,
  'aria-hidden': true,
})

/** Gafas de control: montura con las zonas de tratamiento marcadas. */
export function IlustracionGafas(p: Props) {
  return (
    <svg {...marco(p)}>
      <path d="M14 28 Q8 20 2 18" strokeWidth="3" strokeLinecap="round" />
      <path d="M106 28 Q112 20 118 18" strokeWidth="3" strokeLinecap="round" />
      <path d="M52 38 Q60 32 68 38" strokeWidth="3" strokeLinecap="round" />
      {[32, 88].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="42" r="20" fill="currentColor" fillOpacity="0.14" />
          <circle cx={cx} cy="42" r="20" strokeWidth="3.5" />
          {/* Las zonas perifericas de tratamiento, concentricas al centro optico. */}
          <circle cx={cx} cy="42" r="13" strokeWidth="1.4" opacity="0.45" />
          <circle cx={cx} cy="42" r="6.5" strokeWidth="1.4" opacity="0.45" />
        </g>
      ))}
    </svg>
  )
}

/** Lente blando: la concavidad vista en tres cuartos, con sus anillos. */
export function IlustracionLentesBlandos(p: Props) {
  return (
    <svg {...marco(p)}>
      <ellipse cx="60" cy="44" rx="40" ry="25" fill="currentColor" fillOpacity="0.14" />
      <ellipse cx="60" cy="44" rx="40" ry="25" strokeWidth="3.5" />
      <ellipse cx="60" cy="44" rx="26" ry="16" strokeWidth="1.6" opacity="0.5" />
      <ellipse cx="60" cy="44" rx="12" ry="7.5" strokeWidth="1.6" opacity="0.5" />
      {/* El borde que se apoya en la cornea. */}
      <path d="M20 44 Q60 14 100 44" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M34 32 Q42 25 52 23" strokeWidth="2.6" strokeLinecap="round" opacity="0.55" />
    </svg>
  )
}

/** Ortoqueratologia: el lente rigido que se usa de noche sobre la cornea. */
export function IlustracionOrtok(p: Props) {
  return (
    <svg {...marco(p)}>
      {/* La luna, grande: el tratamiento ocurre mientras el nino duerme. */}
      <path
        d="M96 8a15 15 0 1 0 13 13 11.6 11.6 0 0 1-13-13Z"
        fill="currentColor"
        fillOpacity="0.9"
        strokeWidth="0"
      />
      <path d="M78 12.5 79.2 15l2.5 1.2-2.5 1.2L78 20l-1.2-2.6-2.5-1.2 2.5-1.2Z" {...{ fill: 'currentColor', stroke: 'none' }} opacity="0.55" />
      <circle cx="70" cy="30" r="1.6" fill="currentColor" strokeWidth="0" opacity="0.4" />

      {/* La cornea. */}
      <path d="M18 64 Q46 30 74 64 Z" fill="currentColor" fillOpacity="0.14" strokeWidth="0" />
      <path d="M18 64 Q46 30 74 64" strokeWidth="2.6" opacity="0.65" strokeLinecap="round" />
      <line x1="12" y1="64" x2="80" y2="64" strokeWidth="2.4" opacity="0.4" strokeLinecap="round" />

      {/* El lente, por encima y mas plano en el centro: eso es lo que hace. */}
      <path d="M13 64 C20 26 72 26 79 64" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

/** Atropina: el gotero y la gota. */
export function IlustracionAtropina(p: Props) {
  return (
    <svg {...marco(p)}>
      <rect x="40" y="6" width="20" height="10" rx="2.5" fill="currentColor" strokeWidth="0" />
      <rect x="43" y="15" width="14" height="9" strokeWidth="3" />
      <path
        d="M38 32a8 8 0 0 1 5-7.5V24h14v.5a8 8 0 0 1 5 7.5v32a7 7 0 0 1-7 7H45a7 7 0 0 1-7-7Z"
        fill="currentColor"
        fillOpacity="0.16"
        strokeWidth="3"
      />
      {/* Etiqueta de la concentracion: la app no impone marca ni dosis. */}
      <line x1="38" y1="46" x2="62" y2="46" strokeWidth="2" opacity="0.45" />
      <line x1="43" y1="54" x2="57" y2="54" strokeWidth="2" opacity="0.3" />
      {/* La gota de la noche. */}
      <path
        d="M86 36c5 6.5 8 11 8 14a8 8 0 0 1-16 0c0-3 3-7.5 8-14Z"
        fill="currentColor"
        fillOpacity="0.9"
        strokeWidth="0"
      />
      <circle cx="84" cy="24" r="2.4" fill="currentColor" strokeWidth="0" opacity="0.5" />
    </svg>
  )
}

export function IlustracionTratamiento({
  tipo,
  className,
}: {
  tipo: TipoTratamiento
  className?: string
}) {
  switch (tipo) {
    case 'gafas':
      return <IlustracionGafas className={className} />
    case 'lentes_blandos':
      return <IlustracionLentesBlandos className={className} />
    case 'ortok':
      return <IlustracionOrtok className={className} />
    case 'atropina':
      return <IlustracionAtropina className={className} />
  }
}
