import Link from 'next/link'

import { signOut } from '@/auth'
import { requerirAprobado } from '@/lib/auth/sesion'
import { Logo } from '@/components/marca/Logo'
import { NavegacionMovil } from '@/components/marca/NavegacionMovil'
import { SITIO } from '@/config/sitio'

export default async function LayoutPrivado({ children }: { children: React.ReactNode }) {
  const sesion = await requerirAprobado()

  return (
    <div className="min-h-screen bg-crema">
      <header className="no-imprimir sticky top-0 z-20 bg-crema/95 backdrop-blur">
        <span className="cinta-mml" aria-hidden />
        <div className="mx-auto flex max-w-5xl items-center gap-3 border-b border-borde/70 px-4 py-2.5">
          <Link href="/panel" className="flex min-w-0 items-center gap-2.5">
            <Logo tamano={32} />
            <span className="truncate font-titulo text-base leading-tight sm:text-lg">
              {SITIO.nombreCorto}
            </span>
          </Link>

          {/* En celular la navegacion vive abajo, al alcance del pulgar. */}
          <nav className="ml-auto hidden items-center gap-1 text-sm md:flex">
            <Link href="/panel" className="rounded-lg px-2.5 py-1.5 hover:bg-white">
              Pacientes
            </Link>
            <Link href="/ajustes/equipos" className="rounded-lg px-2.5 py-1.5 hover:bg-white">
              Equipos
            </Link>
            {sesion.user.isAdmin && (
              <>
                <Link href="/admin/aprobaciones" className="rounded-lg px-2.5 py-1.5 hover:bg-white">
                  Accesos
                </Link>
                <Link href="/admin/credenciales" className="rounded-lg px-2.5 py-1.5 hover:bg-white">
                  Acreditaciones
                </Link>
              </>
            )}
          </nav>

          <form
            className="ml-auto md:ml-0"
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/' })
            }}
          >
            <button
              type="submit"
              className="rounded-lg px-2.5 py-1.5 text-sm text-grisTexto hover:bg-white"
            >
              Salir
            </button>
          </form>
        </div>
      </header>

      {/* El relleno inferior deja sitio a la barra de navegacion del celular. */}
      <main className="mx-auto max-w-5xl px-4 py-5 pb-24 md:pb-10">{children}</main>

      <footer className="no-imprimir mx-auto max-w-5xl px-4 pb-24 text-xs leading-relaxed text-grisTexto md:pb-8">
        <p>
          Este contenido es educativo y no reemplaza una valoracion visual individual. La
          aplicacion registra y calcula; no diagnostica ni decide tratamientos.
        </p>
        <p className="mt-1">
          {SITIO.organizacion} · {SITIO.dominio}
        </p>
      </footer>

      <NavegacionMovil esAdmin={Boolean(sesion.user.isAdmin)} />
    </div>
  )
}
