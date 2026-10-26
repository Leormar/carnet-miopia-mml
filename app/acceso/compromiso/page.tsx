import { redirect } from 'next/navigation'

import { pasoPendiente, requerirAprobadoSinCompuertas } from '@/lib/auth/sesion'
import { FormularioCompromiso } from './FormularioCompromiso'
import { COMPROMISO, VERSION_COMPROMISO } from '@/config/compromiso'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Compromiso de manejo de información' }

export default async function Compromiso() {
  const sesion = await requerirAprobadoSinCompuertas()
  const falta = await pasoPendiente(sesion)
  if (falta === null) redirect('/panel')
  if (falta === 'credencial') redirect('/acceso/credencial')

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-grisTexto">Paso 1 de 2</p>
      <h1 className="mt-1 font-titulo text-2xl">Compromiso de manejo de información</h1>
      <p className="mt-2 text-sm leading-relaxed text-grisMedio">
        Antes de entrar por primera vez, lea este compromiso y firmelo. Queda registrado que
        usted acepto la version {VERSION_COMPROMISO}, con la fecha y la hora.
      </p>

      <div className="mt-5 space-y-4">
        {COMPROMISO.map((punto) => (
          <section key={punto.titulo} className="tarjeta">
            <h2 className="font-titulo text-lg">{punto.titulo}</h2>
            <div className="mt-1.5 space-y-2">
              {punto.parrafos.map((parrafo) => (
                <p key={parrafo} className="text-sm leading-relaxed text-grisMedio">
                  {parrafo}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <FormularioCompromiso nombre={sesion.user.name ?? sesion.user.email ?? ''} />
    </>
  )
}
