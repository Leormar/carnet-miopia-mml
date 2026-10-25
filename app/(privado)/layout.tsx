import Link from 'next/link'

import { signOut } from '@/auth'
import { requerirAprobado } from '@/lib/auth/sesion'
import { Logo, BarrasMML } from '@/components/marca/Logo'
import { SITIO } from '@/config/sitio'

export default async function LayoutPrivado({ children }: { children: React.ReactNode }) {
  const sesion = await requerirAprobado()

  return (
    <div className="min-h-screen bg-crema">
      <header className="no-imprimir sticky top-0 z-20 border-b border-borde bg-crema/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link href="/panel" className="flex items-center gap-2.5">
            <Logo tamano={34} />
            <span className="font-titulo text-base leading-tight sm:text-lg">
              {SITIO.nombreCorto}
            </span>
          </Link>

          <nav className="ml-auto flex items-center gap-1 text-sm">
            <Link href="/panel" className="rounded-lg px-2.5 py-1.5 hover:bg-white">
              Pacientes
            </Link>
            <Link href="/ajustes/equipos" className="rounded-lg px-2.5 py-1.5 hover:bg-white">
              Equipos
            </Link>
            {sesion.user.isAdmin && (
              <Link href="/admin/aprobaciones" className="rounded-lg px-2.5 py-1.5 hover:bg-white">
                Accesos
              </Link>
            )}
            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/' })
              }}
            >
              <button
                type="submit"
                className="rounded-lg px-2.5 py-1.5 text-grisTexto hover:bg-white"
              >
                Salir
              </button>
            </form>
          </nav>
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-2">
          <BarrasMML />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5 pb-16">{children}</main>

      <footer className="no-imprimir mx-auto max-w-5xl px-4 pb-8 text-xs leading-relaxed text-grisTexto">
        <p>
          Este contenido es educativo y no reemplaza una valoracion visual individual. La
          aplicacion registra y calcula; no diagnostica ni decide tratamientos.
        </p>
        <p className="mt-1">
          {SITIO.organizacion} · {SITIO.dominio}
        </p>
      </footer>
    </div>
  )
}
