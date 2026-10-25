'use client'

import { IconoImprimir } from '@/components/marca/IconosTratamiento'

export function BotonImprimir() {
  return (
    <button type="button" onClick={() => window.print()} className="boton-magenta">
      <IconoImprimir className="h-4 w-4" />
      Imprimir o guardar en PDF
    </button>
  )
}
