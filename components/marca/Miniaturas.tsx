/**
 * Miniaturas de la portada. En vez de un icono generico, cada tarjeta muestra
 * en pequeno lo que la aplicacion hace de verdad: la curva de longitud axial
 * de los dos ojos, la tira de la semana, la linea de controles y la hoja del
 * carnet. No llevan cifras: son la forma, no el dato.
 */

const CREMA = '#faf8f3'
const BORDE = '#ddd6c8'
const TINTA = '#111c26'

type Props = { className?: string }

/** Longitud axial de los dos ojos a lo largo del tiempo. Sube y se aplana. */
export function MiniBiometria({ className = '' }: Props) {
  const od = '14,44 44,36 74,30 104,26 134,24'
  const oi = '14,47 44,40 74,35 104,32 134,30'
  return (
    <svg viewBox="0 0 148 56" className={className} role="img" aria-label="Curva de longitud axial de los dos ojos">
      {[20, 32, 44].map((y) => (
        <line key={y} x1="10" y1={y} x2="138" y2={y} stroke={BORDE} strokeWidth="1" opacity="0.55" />
      ))}
      <line x1="10" y1="50" x2="138" y2="50" stroke={BORDE} strokeWidth="1.5" />
      <polyline points={oi} fill="none" stroke="#1fa3dd" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" strokeLinecap="round" />
      <polyline points={od} fill="none" stroke="#1fa3dd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {od.split(' ').map((p) => {
        const [x, y] = p.split(',')
        return <circle key={p} cx={x} cy={y} r="2.6" fill={CREMA} stroke="#1fa3dd" strokeWidth="1.6" />
      })}
      <circle cx="134" cy="24" r="3.2" fill="#5a9a3a" stroke={CREMA} strokeWidth="1.6" />
    </svg>
  )
}

/** La tira de la semana: cumplido, no cumplido y sin registro. */
export function MiniAdherencia({ className = '' }: Props) {
  const dias: ('si' | 'no' | 'vacio')[] = ['si', 'si', 'si', 'no', 'si', 'si', 'vacio']
  return (
    <svg viewBox="0 0 148 56" className={className} role="img" aria-label="Tira de uso de los últimos siete días">
      {dias.map((d, i) => {
        const x = 10 + i * 18.5
        const comun = { x, y: 16, width: 14, height: 22, rx: 4 }
        if (d === 'si') return <rect key={i} {...comun} fill="#e2104f" />
        if (d === 'no') return <rect key={i} {...comun} fill={BORDE} />
        return <rect key={i} {...comun} fill="none" stroke={BORDE} strokeWidth="1.5" strokeDasharray="3 3" />
      })}
      {dias.map((_, i) => (
        <rect key={`p${i}`} x={10 + i * 18.5 + 4.5} y="43" width="5" height="2.5" rx="1.25" fill={BORDE} />
      ))}
    </svg>
  )
}

/** Los controles del primer ano sobre una linea de tiempo. */
export function MiniCalendario({ className = '' }: Props) {
  const hitos = [14, 44, 74, 104, 134]
  return (
    <svg viewBox="0 0 148 56" className={className} role="img" aria-label="Línea de controles programados">
      <line x1="14" y1="28" x2="134" y2="28" stroke={BORDE} strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="28" x2="74" y2="28" stroke="#5a9a3a" strokeWidth="2" strokeLinecap="round" />
      {hitos.map((x, i) => {
        const hecho = i < 2
        const siguiente = i === 2
        return (
          <g key={x}>
            <line x1={x} y1="20" x2={x} y2="36" stroke={BORDE} strokeWidth="1" opacity="0.7" />
            {hecho ? (
              <circle cx={x} cy="28" r="4.5" fill="#5a9a3a" />
            ) : siguiente ? (
              <circle cx={x} cy="28" r="4.5" fill={CREMA} stroke="#5a9a3a" strokeWidth="2.2" />
            ) : (
              <circle cx={x} cy="28" r="3.5" fill={BORDE} />
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** La hoja del carnet, con sus cuatro barras de color arriba. */
export function MiniCarnet({ className = '' }: Props) {
  const barras = ['#f5c400', '#5a9a3a', '#1fa3dd', '#e2104f']
  return (
    <svg viewBox="0 0 148 56" className={className} role="img" aria-label="Hoja del carnet en PDF">
      <rect x="44" y="5" width="60" height="46" rx="4" fill="#fff" stroke={BORDE} strokeWidth="1.5" />
      {barras.map((c, i) => (
        <rect key={c} x={50 + i * 8} y="10" width="6" height="2.5" rx="1.25" fill={c} />
      ))}
      <rect x="50" y="18" width="34" height="3" rx="1.5" fill={TINTA} opacity="0.75" />
      {[25, 31, 37, 43].map((y, i) => (
        <rect key={y} x="50" y={y} width={i % 2 === 0 ? 48 : 38} height="2" rx="1" fill={BORDE} />
      ))}
    </svg>
  )
}
