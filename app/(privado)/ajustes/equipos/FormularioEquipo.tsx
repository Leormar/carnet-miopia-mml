'use client'

import { useFormState } from 'react-dom'

import { crearEquipo } from '../../pacientes/acciones'
import { BotonEnviar, Campo, Texto } from '@/components/ui/Campo'
import { Aviso } from '@/components/ui/Aviso'
import type { ResultadoAccion } from '@/lib/validacion/esquemas'

export function FormularioEquipo() {
  const [estado, accion] = useFormState<ResultadoAccion | null, FormData>(crearEquipo, null)
  const e = estado && !estado.ok ? (estado.campos ?? {}) : {}

  return (
    <form action={accion} className="mt-3 space-y-3" key={estado?.ok ? Math.random() : 'form'}>
      {estado && !estado.ok && <Aviso nivel="alerta">{estado.error}</Aviso>}
      <Campo etiqueta="Nombre del equipo" nombre="name" error={e.name} requerido>
        <Texto nombre="name" placeholder="IOLMaster 700" error={e.name} required />
      </Campo>
      <Campo etiqueta="Numero de serie" nombre="serial">
        <Texto nombre="serial" />
      </Campo>
      <BotonEnviar className="boton-primario w-full">Agregar</BotonEnviar>
    </form>
  )
}
