'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'

import { crearEnlaceCompartido, type ResultadoEnlace } from '../../acciones'
import { BotonEnviar, Campo, Selector, Texto } from '@/components/ui/Campo'
import { Aviso } from '@/components/ui/Aviso'
import { IconoCheck, IconoImprimir, IconoQr } from '@/components/marca/IconosTratamiento'
import { DIAS_POR_DEFECTO, DURACIONES } from '@/config/compartir'
import { fechaLarga } from '@/lib/clinica/edad'

export function FormularioEnlace({
  patientId,
  nombrePaciente,
}: {
  patientId: string
  nombrePaciente: string
}) {
  const [estado, accion] = useFormState<ResultadoEnlace | null, FormData>(
    crearEnlaceCompartido.bind(null, patientId),
    null,
  )
  const errores = estado && !estado.ok ? (estado.campos ?? {}) : {}

  return (
    <>
      <form action={accion} className="tarjeta no-imprimir mt-3 space-y-3">
        {estado && !estado.ok && <Aviso nivel="alerta">{estado.error}</Aviso>}

        <Campo
          etiqueta="Para quien es"
          nombre="label"
          error={errores.label}
          ayuda="Queda en la bitacora. Por ejemplo: oftalmologia pediatrica, Dra. Ramirez."
        >
          <Texto
            nombre="label"
            placeholder="Oftalmologia pediatrica"
            maxLength={120}
            error={errores.label}
          />
        </Campo>

        <Campo etiqueta="Vence en" nombre="dias" error={errores.dias}>
          <Selector
            nombre="dias"
            defaultValue={String(DIAS_POR_DEFECTO)}
            error={errores.dias}
            opciones={DURACIONES.map((d) => ({ valor: String(d.dias), texto: d.texto }))}
          />
        </Campo>

        <BotonEnviar className="boton-magenta w-full sm:w-auto">
          <IconoQr className="h-4 w-4" />
          Generar enlace y QR
        </BotonEnviar>
      </form>

      {estado?.ok && (
        <EnlaceNuevo
          url={estado.url}
          svg={estado.svg}
          etiqueta={estado.etiqueta}
          vence={estado.vence}
          nombrePaciente={nombrePaciente}
        />
      )}
    </>
  )
}

function EnlaceNuevo({
  url,
  svg,
  etiqueta,
  vence,
  nombrePaciente,
}: {
  url: string
  svg: string
  etiqueta: string | null
  vence: string
  nombrePaciente: string
}) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      window.setTimeout(() => setCopiado(false), 2500)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <section className="tarjeta mt-4 border-verde/40">
      <div className="no-imprimir">
        <Aviso nivel="aviso" titulo="Copie el enlace ahora">
          Es la unica vez que se muestra. De aqui en adelante solo queda guardada su huella; si
          se pierde, revoque este enlace y genere otro.
        </Aviso>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div
          className="w-44 shrink-0 rounded-mml border border-borde bg-white p-2 sm:w-48"
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="font-titulo text-lg">Carnet de {nombrePaciente}</p>
          <p className="text-sm text-grisTexto">
            Vista de solo lectura{etiqueta ? ` para ${etiqueta}` : ''}. Vence el{' '}
            {fechaLarga(vence)}.
          </p>

          <div className="no-imprimir mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Enlace de solo lectura"
              className="campo min-w-0 flex-1 font-mono text-xs"
            />
            <button type="button" onClick={copiar} className="boton-secundario shrink-0">
              {copiado ? <IconoCheck className="h-4 w-4 text-verde" /> : null}
              {copiado ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          {/* En papel el QR no sirve de nada sin la direccion escrita. */}
          <p className="mt-3 hidden break-all font-mono text-[10px] text-grisTexto print:block">
            {url}
          </p>

          <button
            type="button"
            onClick={() => window.print()}
            className="boton-secundario no-imprimir mt-3"
          >
            <IconoImprimir className="h-4 w-4" />
            Imprimir la hoja con el QR
          </button>
        </div>
      </div>
    </section>
  )
}
