import { signOut } from '@/auth'
import { Logo, BarrasMML } from '@/components/marca/Logo'
import { SITIO } from '@/config/sitio'

export default function LayoutAcceso({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-crema">
      <header className="border-b border-borde bg-crema/95">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5 px-4 py-3">
          <Logo tamano={34} />
          <div className="min-w-0">
            <p className="font-titulo text-base leading-tight sm:text-lg">{SITIO.nombreCorto}</p>
            <p className="truncate text-xs text-grisTexto">{SITIO.organizacion}</p>
          </div>
          <form
            className="ml-auto"
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/' })
            }}
          >
            <button type="submit" className="rounded-lg px-2.5 py-1.5 text-sm text-grisTexto hover:bg-white">
              Salir
            </button>
          </form>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-2">
          <BarrasMML />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 pb-16">{children}</main>

      <footer className="mx-auto max-w-3xl px-4 pb-10 text-xs leading-relaxed text-grisTexto">
        <p>
          {SITIO.organizacion} · {SITIO.dominio}
        </p>
      </footer>
    </div>
  )
}
