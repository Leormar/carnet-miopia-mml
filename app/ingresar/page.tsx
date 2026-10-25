import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth, signIn } from '@/auth'
import { Logo, BarrasMML } from '@/components/marca/Logo'
import { Aviso } from '@/components/ui/Aviso'
import { SITIO } from '@/config/sitio'

export const metadata = { title: 'Ingresar' }

const APPLE_ACTIVO = Boolean(process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET)

function IconoGoogle() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8h-4v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.1 7.1 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8Z" />
    </svg>
  )
}

function IconoApple() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M16.4 12.7c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.6-1.9-1.5-.2-3 .9-3.7.9-.8 0-2-.9-3.3-.8-1.7 0-3.2 1-4.1 2.5-1.7 3-.4 7.5 1.3 10 .8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8 2.2-1.2 3-2.4a10 10 0 0 0 1.3-2.8c-.1 0-2.6-1-2.6-3.9ZM14.3 4.6c.7-.8 1.1-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4Z" />
    </svg>
  )
}

export default async function Ingresar({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const sesion = await auth()
  if (sesion?.user?.status === 'aprobado') redirect('/panel')
  if (sesion?.user) redirect('/pendiente')

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <div className="flex items-center gap-3">
        <Logo />
        <div>
          <p className="font-titulo text-lg leading-tight">{SITIO.nombreCorto}</p>
          <p className="text-sm text-grisTexto">{SITIO.organizacion}</p>
        </div>
      </div>
      <BarrasMML className="mt-3" />

      <h1 className="mt-7 font-titulo text-2xl">Ingresar</h1>
      <p className="mt-2 text-sm leading-relaxed text-grisMedio">
        Entre con su cuenta de Google o de Apple. El acceso a los datos clinicos es cerrado: si es
        la primera vez, su solicitud queda pendiente de aprobacion.
      </p>

      {searchParams.error && (
        <div className="mt-4">
          <Aviso nivel="alerta" titulo="No fue posible ingresar">
            Intente de nuevo. Si el problema sigue, escriba al profesional que le compartio el
            enlace.
          </Aviso>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <form
          action={async () => {
            'use server'
            await signIn('google', { redirectTo: '/panel' })
          }}
        >
          <button type="submit" className="boton-secundario w-full">
            <IconoGoogle />
            Continuar con Google
          </button>
        </form>

        {APPLE_ACTIVO && (
          <form
            action={async () => {
              'use server'
              await signIn('apple', { redirectTo: '/panel' })
            }}
          >
            <button type="submit" className="boton w-full bg-tinta text-white hover:bg-tinta/90">
              <IconoApple />
              Continuar con Apple
            </button>
          </form>
        )}
      </div>

      {!APPLE_ACTIVO && (
        <p className="mt-4 text-xs text-grisTexto">
          El ingreso con Apple se activa cuando se configuren sus credenciales en el servidor.
        </p>
      )}

      <p className="mt-8 text-xs leading-relaxed text-grisTexto">
        Al ingresar acepta el tratamiento de sus datos de contacto para administrar el acceso, de
        acuerdo con la Ley 1581 de 2012. Los datos clinicos de los menores solo se registran con el
        consentimiento del padre, madre o representante.
      </p>

      <Link href="/" className="mt-6 text-sm text-azul hover:underline">
        Volver al inicio
      </Link>
    </main>
  )
}
