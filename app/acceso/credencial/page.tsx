import { redirect } from 'next/navigation'

import { pasoPendiente, requerirAprobadoSinCompuertas } from '@/lib/auth/sesion'
import { ultimaCredencial } from '../acciones'
import { FormularioCredencial } from './FormularioCredencial'
import { Aviso } from '@/components/ui/Aviso'
import { ARCHIVO_CREDENCIAL } from '@/config/paises'
import { fechaCorta } from '@/lib/clinica/edad'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Acreditacion profesional' }

export default async function Credencial() {
  const sesion = await requerirAprobadoSinCompuertas()
  const falta = await pasoPendiente(sesion)
  if (falta === 'compromiso') redirect('/acceso/compromiso')
  if (falta === null) redirect('/panel')

  const anterior = await ultimaCredencial(sesion.user.id)

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-grisTexto">Paso 2 de 2</p>
      <h1 className="mt-1 font-titulo text-2xl">Acredite su ejercicio profesional</h1>
      <p className="mt-2 text-sm leading-relaxed text-grisMedio">
        Esta aplicacion guarda historias clinicas de ninos. Para abrirla necesitamos constancia de
        que usted esta habilitado para ejercer en su pais. El documento lo revisa un administrador
        de la red y no se comparte con nadie mas.
      </p>

      {anterior?.status === 'rechazada' && (
        <div className="mt-4">
          <Aviso nivel="alerta" titulo="El documento anterior no fue aceptado">
            {anterior.rejectionReason ?? 'Suba un documento que acredite su habilitacion vigente.'}
            {' '}Enviado el {fechaCorta(anterior.uploadedAt)}.
          </Aviso>
        </div>
      )}

      <div className="mt-4">
        <Aviso>
          Puede entrar apenas lo suba: no tiene que esperar a que lo revisen. Se aceptan{' '}
          {ARCHIVO_CREDENCIAL.extensiones}, hasta {ARCHIVO_CREDENCIAL.maximoTexto}.
        </Aviso>
      </div>

      <FormularioCredencial />
    </>
  )
}
