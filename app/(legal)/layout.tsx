import Link from 'next/link'

import { Logo, BarrasMML } from '@/components/marca/Logo'
import { SITIO } from '@/config/sitio'
import { LEGAL } from '@/config/legal'

export default function LayoutLegal({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-crema">
      <header className="border-b border-borde bg-crema/95">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5 px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo tamano={34} />
            <div className="min-w-0">
              <p className="font-titulo text-base leading-tight sm:text-lg">{SITIO.nombreCorto}</p>
              <p className="truncate text-xs text-grisTexto">{SITIO.organizacion}</p>
            </div>
          </Link>
          <Link
            href="/ingresar"
            className="ml-auto rounded-lg px-2.5 py-1.5 text-sm text-grisTexto hover:bg-white"
          >
            Ingresar
          </Link>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-2">
          <BarrasMML />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-7 pb-16">{children}</main>

      <footer className="mx-auto max-w-3xl px-4 pb-10 text-xs leading-relaxed text-grisTexto">
        <p>
          <Link href="/privacidad" className="hover:underline">
            Politica de privacidad
          </Link>
          {' · '}
          <Link href="/terminos" className="hover:underline">
            Terminos de uso
          </Link>
        </p>
        <p className="mt-1">
          {LEGAL.responsable} · {SITIO.dominio} · Version {LEGAL.version}
        </p>
      </footer>
    </div>
  )
}
