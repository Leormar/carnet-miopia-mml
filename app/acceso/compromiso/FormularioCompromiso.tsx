'use client'

import { useFormState } from 'react-dom'

import { firmarCompromiso } from '../acciones'
import { BotonEnviar } from '@/components/ui/Campo'
import { Aviso } from '@/components/ui/Aviso'
import { CASILLAS_COMPROMISO } from '@/config/compromiso'
import type { ResultadoAccion } from '@/lib/validacion/esquemas'

export function FormularioCompromiso({ nombre }: { nombre: string }) {
  const [estado, accion] = useFormState<ResultadoAccion | null, FormData>(firmarCompromiso, null)

  return (
    <form action={accion} className="tarjeta mt-5 space-y-4">
      <h2 className="font-titulo text-lg">Firma</h2>

      {estado && !estado.ok && <Aviso nivel="alerta">{estado.error}</Aviso>}

      <div className="space-y-3">
        {CASILLAS_COMPROMISO.map((texto, i) => (
          <label key={texto} className="flex cursor-pointer items-start gap-2.5 text-sm leading-snug">
            <input
              type="checkbox"
              name={`casilla-${i}`}
              className="mt-0.5 h-4 w-4 shrink-0 accent-magenta"
            />
            <span>{texto}</span>
          </label>
        ))}
      </div>

      <p className="text-xs text-grisTexto">
        Firma {nombre}. Se guardan la fecha, la hora, su direccion IP y el navegador desde el que
        firma, como constancia.
      </p>

      <BotonEnviar className="boton-magenta w-full sm:w-auto">Firmar y continuar</BotonEnviar>
    </form>
  )
}
