import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth, signIn } from '@/auth'
import { Logo, BarrasMML } from '@/components/marca/Logo'
import { BotonGoogle } from '@/components/marca/BotonGoogle'
import { Aviso } from '@/components/ui/Aviso'
import { IconoTratamiento, IconoVolver } from '@/components/marca/IconosTratamiento'
import { ORDEN_TRATAMIENTOS, TRATAMIENTOS } from '@/config/tratamientos'
import { SITIO } from '@/config/sitio'

export const metadata = { title: 'Ingresar' }

const APPLE_ACTIVO = Boolean(process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET)

function IconoApple() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
      <path d="M16.4 12.7c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.6-1.9-1.5-.2-3 .9-3.7.9-.8 0-2-.9-3.3-.8-1.7 0-3.2 1-4.1 2.5-1.7 3-.4 7.5 1.3 10 .8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8 2.2-1.2 3-2.4a10 10 0 0 0 1.3-2.8c-.1 0-2.6-1-2.6-3.9ZM14.3 4.6c.7-.8 1.1-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4Z" />
    </svg>
  )
}

const MENSAJE_ERROR: Record<string, string> = {
  Configuration:
    'El servidor no tiene completa la configuracion de ingreso. Avise al administrador.',
  AccessDenied:
    'Google no autorizo el ingreso con esa cuenta. Si la aplicacion esta en modo de prueba, su correo debe estar en la lista de usuarios de prueba.',
  Verification: 'El enlace de verificacion ya vencio o se uso antes.',
}

export default async function Ingresar({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const sesion = await auth()
  if (sesion?.user?.status === 'aprobado') redirect('/panel')
  if (sesion?.user) redirect('/pendiente')

  const error = searchParams.error

  return (
    <div className="min-h-screen bg-crema lg:grid lg:grid-cols-[1fr_1.05fr]">
      <span className="cinta-mml lg:hidden" aria-hidden />

      {/* Columna de ingreso */}
      <main className="flex flex-col justify-center px-5 pb-10 pt-7 sm:px-10 lg:min-h-screen lg:px-14 lg:pt-10">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-3">
            <Logo tamano={44} />
            <span>
              <span className="block font-titulo text-lg leading-tight">{SITIO.nombreCorto}</span>
              <span className="block text-sm text-grisTexto">{SITIO.organizacion}</span>
            </span>
          </Link>
          <BarrasMML className="mt-4 hidden lg:flex" />

          <h1 className="mt-6 font-titulo text-[2rem] leading-tight">Ingresar</h1>
          <p className="mt-2 leading-relaxed text-grisMedio">
            Entre con su cuenta para ver el carnet, registrar controles o anotar el uso de cada
            dia.
          </p>

          {error && (
            <div className="mt-5">
              <Aviso nivel="alerta" titulo="No fue posible ingresar">
                {MENSAJE_ERROR[error] ??
                  'Intente de nuevo. Si el problema sigue, escriba al profesional que le compartio el enlace.'}
              </Aviso>
            </div>
          )}

          <div className="mt-7 space-y-3">
            <BotonGoogle texto="Continuar con Google" grande className="w-full [&>button]:w-full" />

            {APPLE_ACTIVO && (
              <form
                action={async () => {
                  'use server'
                  await signIn('apple', { redirectTo: '/panel' })
                }}
              >
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-tinta px-7 py-4 text-lg font-semibold text-white transition hover:bg-tinta/90"
                >
                  <IconoApple />
                  Continuar con Apple
                </button>
              </form>
            )}
          </div>

          <div className="mt-7 rounded-2xl border border-borde bg-white p-4">
            <p className="text-sm font-semibold">El acceso es cerrado</p>
            <p className="mt-1 text-sm leading-relaxed text-grisMedio">
              Si es la primera vez, su cuenta queda pendiente de aprobacion. Un administrador la
              habilita y le avisa al mismo correo. Nadie ve datos clinicos antes de eso.
            </p>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-grisTexto">
            Al ingresar acepta el tratamiento de sus datos de contacto para administrar el acceso,
            conforme a la Ley 1581 de 2012. Los datos clinicos de los menores solo se registran con
            el consentimiento del padre, madre o representante.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-azul hover:underline"
          >
            <IconoVolver className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </main>

      {/* Columna de contexto, solo en pantalla grande */}
      <aside className="relative overflow-hidden border-t border-borde/70 bg-white px-5 py-10 sm:px-10 lg:flex lg:flex-col lg:justify-center lg:border-t-0 lg:px-14 lg:py-0">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 80% 15%, #1fa3dd 0, transparent 45%), radial-gradient(circle at 20% 80%, #e2104f 0, transparent 42%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-md lg:mx-0">
          <p className="font-titulo text-[1.75rem] leading-tight lg:text-3xl">
            Si no se usa, no funciona
          </p>
          <p className="mt-3 leading-relaxed text-grisMedio">
            Las gafas, los lentes y las gotas para desacelerar la miopia no actuan por estar en el
            estuche: actuan mientras estan puestos. El carnet hace visible ese uso, junto al
            crecimiento del ojo.
          </p>

          <div className="mt-6 space-y-2.5 lg:mt-8">
            {ORDEN_TRATAMIENTOS.map((tipo) => {
              const d = TRATAMIENTOS[tipo]
              return (
                <div
                  key={tipo}
                  className="flex items-center gap-3 rounded-xl border border-borde bg-crema px-4 py-3"
                  style={{ borderLeft: `4px solid ${d.color}` }}
                >
                  <span style={{ color: d.color }}>
                    <IconoTratamiento tipo={tipo} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-tight">{d.nombre}</span>
                    <span className="block text-xs text-grisTexto">
                      {d.modoRegistro === 'horas'
                        ? 'Se registran las horas de uso de cada dia'
                        : d.modoRegistro === 'noche'
                          ? 'Se registra si durmio con los lentes'
                          : 'Se registra si se puso la gota'}
                    </span>
                  </span>
                </div>
              )
            })}
          </div>

          <p className="mt-8 text-xs leading-relaxed text-grisTexto">
            Este contenido es educativo y no reemplaza una valoracion visual individual.
          </p>
        </div>
      </aside>
    </div>
  )
}
