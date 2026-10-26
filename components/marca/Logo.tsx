import Image from 'next/image'

export function Logo({ tamano = 44 }: { tamano?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Grupo Manejo Miopía Latam"
      width={tamano}
      height={tamano}
      priority
      className="rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
    />
  )
}

/** Las cuatro barras de color de la cabecera del carnet de papel. */
export function BarrasMML({ className = '' }: { className?: string }) {
  return (
    <div className={`flex gap-[5px] ${className}`} aria-hidden>
      {['#f5c400', '#5a9a3a', '#1fa3dd', '#e2104f'].map((c) => (
        <span key={c} className="block h-1 w-[26px]" style={{ background: c }} />
      ))}
    </div>
  )
}
