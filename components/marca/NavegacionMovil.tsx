'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { IconoCalendario, IconoMas, IconoOjo } from './IconosTratamiento'

/**
 * Barra inferior de navegacion. Solo aparece en celular, que es donde la
 * aplicacion se usa en consulta y donde la cabecera superior queda lejos del
 * pulgar. En pantalla ancha manda la cabecera y esta barra desaparece.
 */

function IconoPersonas({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19" />
      <circle cx="10" cy="7.5" r="3.2" />
      <path d="M20 19v-1.4a3.5 3.5 0 0 0-2.6-3.4M15.4 5.2a3.2 3.2 0 0 1 0 5.9" />
    </svg>
  )
}

function IconoEscudo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3.5 5 6.2v5c0 4.2 2.9 7.5 7 9.3 4.1-1.8 7-5.1 7-9.3v-5Z" />
      <path d="m9.2 11.8 2 2 3.6-3.8" />
    </svg>
  )
}

type Enlace = {
  href: string
  texto: string
  Icono: (p: { className?: string }) => JSX.Element
  /** Coincide tambien con las rutas que cuelgan de esta. */
  prefijo?: string
}

export function NavegacionMovil({ esAdmin }: { esAdmin: boolean }) {
  const ruta = usePathname()

  const enlaces: Enlace[] = [
    { href: '/panel', texto: 'Pacientes', Icono: IconoPersonas },
    { href: '/pacientes/nuevo', texto: 'Nuevo', Icono: IconoMas },
    { href: '/ajustes/equipos', texto: 'Equipos', Icono: IconoOjo },
  ]
  enlaces.push(
    esAdmin
      ? { href: '/admin/aprobaciones', texto: 'Accesos', Icono: IconoEscudo, prefijo: '/admin' }
      : { href: '/panel', texto: 'Agenda', Icono: IconoCalendario },
  )

  return (
    <nav className="nav-movil no-imprimir" aria-label="Navegación principal">
      <div className="flex items-stretch">
        {enlaces.map(({ href, texto, Icono, prefijo }) => {
          const activo = prefijo ? ruta.startsWith(prefijo) : ruta === href
          return (
            <Link
              key={texto}
              href={href}
              aria-current={activo ? 'page' : undefined}
              className={`nav-enlace ${activo ? 'nav-enlace-activo' : ''}`}
            >
              <Icono className="h-6 w-6" />
              {texto}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
