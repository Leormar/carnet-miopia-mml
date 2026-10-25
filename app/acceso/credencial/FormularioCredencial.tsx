'use client'

import { useFormState } from 'react-dom'

import { subirCredencial } from '../acciones'
import { BotonEnviar, Campo, Selector, Texto } from '@/components/ui/Campo'
import { Aviso } from '@/components/ui/Aviso'
import { ARCHIVO_CREDENCIAL, PAISES, TIPOS_DE_CREDENCIAL } from '@/config/paises'
import type { ResultadoAccion } from '@/lib/validacion/esquemas'

export function FormularioCredencial() {
  const [estado, accion] = useFormState<ResultadoAccion | null, FormData>(subirCredencial, null)
  const e = estado && !estado.ok ? (estado.campos ?? {}) : {}

  return (
    <form action={accion} className="tarjeta mt-5 space-y-4">
      {estado && !estado.ok && <Aviso nivel="alerta">{estado.error}</Aviso>}

      <Campo etiqueta="Pais donde ejerce" nombre="country" error={e.country} requerido>
        <Selector
          nombre="country"
          error={e.country}
          defaultValue=""
          opciones={[
            { valor: '', texto: 'Elija el pais' },
            ...PAISES.map((p) => ({ valor: p, texto: p })),
          ]}
        />
      </Campo>

      <Campo etiqueta="Que documento va a subir" nombre="documentType" error={e.documentType} requerido>
        <Selector
          nombre="documentType"
          error={e.documentType}
          defaultValue=""
          opciones={[
            { valor: '', texto: 'Elija el tipo' },
            ...TIPOS_DE_CREDENCIAL.map((t) => ({ valor: t.valor, texto: t.texto })),
          ]}
        />
      </Campo>

      <Campo
        etiqueta="Como se llama en su pais"
        nombre="officialName"
        error={e.officialName}
        ayuda="El nombre oficial. Por ejemplo, en Colombia: tarjeta profesional de optometria."
        requerido
      >
        <Texto nombre="officialName" maxLength={160} error={e.officialName} />
      </Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Numero del documento" nombre="documentNumber">
          <Texto nombre="documentNumber" maxLength={80} />
        </Campo>
        <Campo etiqueta="Entidad que lo expide" nombre="issuedBy">
          <Texto nombre="issuedBy" maxLength={160} />
        </Campo>
      </div>

      <Campo
        etiqueta="Archivo"
        nombre="archivo"
        error={e.archivo}
        ayuda={`${ARCHIVO_CREDENCIAL.extensiones}, hasta ${ARCHIVO_CREDENCIAL.maximoTexto}`}
        requerido
      >
        <input
          id="archivo"
          name="archivo"
          type="file"
          accept={ARCHIVO_CREDENCIAL.tiposMime.join(',')}
          required
          className={`campo file:mr-3 file:rounded-md file:border-0 file:bg-tinta file:px-3 file:py-1.5
            file:text-sm file:font-semibold file:text-white ${e.archivo ? 'border-magenta' : ''}`}
        />
      </Campo>

      <BotonEnviar className="boton-magenta w-full sm:w-auto">Subir y entrar</BotonEnviar>
    </form>
  )
}
