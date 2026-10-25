'use client'

import { useFormStatus } from 'react-dom'

export function Campo({
  etiqueta,
  nombre,
  error,
  ayuda,
  children,
  requerido,
}: {
  etiqueta: string
  nombre: string
  error?: string
  ayuda?: string
  requerido?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="etiqueta" htmlFor={nombre}>
        {etiqueta}
        {requerido && <span className="ml-0.5 text-magenta">*</span>}
      </label>
      {children}
      {ayuda && !error && <p className="ayuda">{ayuda}</p>}
      {error && <p className="mt-1 text-xs font-medium text-magenta">{error}</p>}
    </div>
  )
}

export function Texto({
  nombre,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { nombre: string; error?: string }) {
  return (
    <input
      id={nombre}
      name={nombre}
      {...props}
      className={`campo ${error ? 'border-magenta' : ''} ${props.className ?? ''}`}
    />
  )
}

export function Area({
  nombre,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { nombre: string; error?: string }) {
  return (
    <textarea
      id={nombre}
      name={nombre}
      {...props}
      className={`campo resize-y ${error ? 'border-magenta' : ''} ${props.className ?? ''}`}
    />
  )
}

export function Selector({
  nombre,
  error,
  opciones,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  nombre: string
  error?: string
  opciones: { valor: string; texto: string }[]
}) {
  return (
    <select
      id={nombre}
      name={nombre}
      {...props}
      className={`campo ${error ? 'border-magenta' : ''} ${props.className ?? ''}`}
    >
      {opciones.map((o) => (
        <option key={o.valor} value={o.valor}>
          {o.texto}
        </option>
      ))}
    </select>
  )
}

export function BotonEnviar({
  children,
  className = 'boton-magenta w-full',
}: {
  children: React.ReactNode
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? 'Guardando...' : children}
    </button>
  )
}

export function Seccion({
  titulo,
  descripcion,
  children,
}: {
  titulo: string
  descripcion?: string
  children: React.ReactNode
}) {
  return (
    <section className="tarjeta">
      <h2 className="font-titulo text-lg">{titulo}</h2>
      {descripcion && <p className="mt-0.5 text-sm text-grisTexto">{descripcion}</p>}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  )
}
