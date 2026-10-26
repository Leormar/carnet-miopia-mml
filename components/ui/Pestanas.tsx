'use client'

/**
 * Pestañas con efecto aladino: el contenido sale de la pestaña que se pulso,
 * como el genio de la lampara, y se despliega hasta ocupar el panel.
 *
 * El efecto de verdad del escritorio deforma una malla, y eso CSS no lo hace.
 * La imitacion que si convence: el panel arranca como una franja angosta justo
 * debajo de la pestaña, se estira hacia abajo, y recien entonces la parte de
 * arriba se abre hasta los bordes. Se consigue animando un `clip-path` en
 * trapecio cuyos dos puntos de arriba empiezan pegados en la x de la pestaña.
 * Esa x se mide al cambiar de pestaña y entra como variable CSS.
 *
 * Solo se anima la entrada. Quien pidio menos movimiento no ve nada de esto.
 */

import { useCallback, useLayoutEffect, useRef, useState } from 'react'

export interface Pestana {
  clave: string
  titulo: string
  /** Numerito a la derecha del titulo. Se omite si es nulo o cero. */
  cuenta?: number | null
  /** Pinta el numerito en magenta: hay algo que mirar. */
  alerta?: boolean
  contenido: React.ReactNode
}

export function Pestanas({
  pestanas,
  inicial,
  etiqueta = 'Secciones del paciente',
}: {
  pestanas: Pestana[]
  inicial?: string
  etiqueta?: string
}) {
  const [activa, setActiva] = useState(inicial ?? pestanas[0]?.clave)
  /** Sube en cada cambio para reiniciar la animacion aunque se repita pestaña. */
  const [turno, setTurno] = useState(0)

  const barraRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const botones = useRef(new Map<string, HTMLButtonElement>())

  /**
   * Pone en el panel la x de la pestaña activa, en porcentaje del ancho del
   * panel. De ahi sale el genio.
   */
  const apuntarALaPestana = useCallback((clave: string) => {
    const panel = panelRef.current
    const boton = botones.current.get(clave)
    if (!panel || !boton) return

    const p = panel.getBoundingClientRect()
    const b = boton.getBoundingClientRect()
    if (p.width === 0) return

    const centro = b.left + b.width / 2 - p.left
    const medio = Math.min(Math.max(b.width / 2, 22), 70)
    const aPorcentaje = (v: number) => `${Math.min(Math.max((v / p.width) * 100, 0), 100)}%`

    panel.style.setProperty('--aladino-x', aPorcentaje(centro))
    panel.style.setProperty('--aladino-x1', aPorcentaje(centro - medio))
    panel.style.setProperty('--aladino-x2', aPorcentaje(centro + medio))
  }, [])

  useLayoutEffect(() => {
    apuntarALaPestana(activa)
  }, [activa, turno, apuntarALaPestana])

  function elegir(clave: string) {
    apuntarALaPestana(clave)
    setActiva(clave)
    setTurno((t) => t + 1)
  }

  /** Flechas para moverse entre pestañas, como manda el patron de tablist. */
  function teclas(e: React.KeyboardEvent, indice: number) {
    const salto = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (salto === 0) return
    e.preventDefault()
    const siguiente = pestanas[(indice + salto + pestanas.length) % pestanas.length]
    elegir(siguiente.clave)
    botones.current.get(siguiente.clave)?.focus()
  }

  const actual = pestanas.find((p) => p.clave === activa) ?? pestanas[0]

  return (
    <div>
      <div
        ref={barraRef}
        role="tablist"
        aria-label={etiqueta}
        className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-px scrollbar-ninguna sm:mx-0 sm:px-0"
      >
        {pestanas.map((p, i) => {
          const esta = p.clave === activa
          return (
            <button
              key={p.clave}
              ref={(el) => {
                if (el) botones.current.set(p.clave, el)
                else botones.current.delete(p.clave)
              }}
              role="tab"
              type="button"
              id={`pestana-${p.clave}`}
              aria-selected={esta}
              aria-controls={`panel-${p.clave}`}
              tabIndex={esta ? 0 : -1}
              onClick={() => elegir(p.clave)}
              onKeyDown={(e) => teclas(e, i)}
              className={`relative shrink-0 whitespace-nowrap rounded-t-xl border border-b-0 px-3.5 py-2.5 text-sm font-semibold transition ${
                esta
                  ? 'z-10 border-borde/70 bg-white text-tinta shadow-[0_-2px_8px_rgba(17,28,38,0.05)]'
                  : 'border-transparent text-grisTexto hover:bg-white/60 hover:text-tinta'
              }`}
            >
              {p.titulo}
              {p.cuenta ? (
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] leading-none ${
                    p.alerta ? 'bg-magenta text-white' : 'bg-crema text-grisTexto'
                  }`}
                >
                  {p.cuenta}
                </span>
              ) : null}
              {esta && (
                /* Tapa la linea del panel para que la pestaña activa se vea unida a el. */
                <span className="absolute inset-x-0 -bottom-px h-px bg-white" />
              )}
            </button>
          )
        })}
      </div>

      <div
        ref={panelRef}
        role="tabpanel"
        id={`panel-${actual.clave}`}
        aria-labelledby={`pestana-${actual.clave}`}
        tabIndex={0}
        className="aladino rounded-b-2xl rounded-tr-2xl border border-borde/70 bg-white p-4 shadow-tarjeta focus:outline-none sm:p-5"
      >
        {/* La clave fuerza el remontaje, y con el la animacion. */}
        <div key={`${actual.clave}-${turno}`} className="aladino-dentro">
          {actual.contenido}
        </div>
      </div>
    </div>
  )
}
