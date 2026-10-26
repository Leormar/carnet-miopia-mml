/**
 * La foto del tratamiento, redonda, para donde hay espacio suficiente.
 *
 * Un icono se lee bien a 14 pixeles y una foto no: a ese tamaño una foto es
 * barro. Por eso la foto entra donde mide 48 pixeles o mas (las tarjetas de
 * tratamiento, los banners de la portada) y el icono se queda donde es chico
 * (las pastillas de la lista, la barra de abajo, los botones).
 */

import Image from 'next/image'

import { FOTOS_TRATAMIENTO } from '@/config/fotos-tratamiento'
import { TRATAMIENTOS, type TipoTratamiento } from '@/config/tratamientos'

export function FotoTratamiento({
  tipo,
  tamano = 56,
  className = '',
}: {
  tipo: TipoTratamiento
  /** Lado en pixeles. Por debajo de 48 use el icono. */
  tamano?: number
  className?: string
}) {
  const foto = FOTOS_TRATAMIENTO[tipo]
  const color = TRATAMIENTOS[tipo].color

  return (
    <span
      className={`relative block shrink-0 overflow-hidden rounded-full ring-2 ${className}`}
      style={{ width: tamano, height: tamano, boxShadow: `0 0 0 2px ${color}` }}
    >
      <Image
        src={foto.src}
        alt={foto.alt}
        fill
        sizes={`${tamano}px`}
        className="object-cover"
        style={{ objectPosition: foto.encuadre }}
      />
    </span>
  )
}
