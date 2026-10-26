import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'

import { auth, signOut } from '@/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { Logo, BarrasMML } from '@/components/marca/Logo'
import { Aviso } from '@/components/ui/Aviso'
import { SITIO } from '@/config/sitio'

export const metadata = { title: 'Solicitud pendiente' }

async function guardarNota(formData: FormData) {
  'use server'
  const sesion = await auth()
  if (!sesion?.user?.id) return
  const nota = String(formData.get('nota') ?? '').slice(0, 500)
  await db.update(users).set({ requestNote: nota }).where(eq(users.id, sesion.user.id))
}

export default async function Pendiente() {
  const sesion = await auth()
  if (!sesion?.user) redirect('/ingresar')
  if (sesion.user.status === 'aprobado') redirect('/panel')

  const [fila] = await db
    .select({ requestNote: users.requestNote, rejectionReason: users.rejectionReason })
    .from(users)
    .where(eq(users.id, sesion.user.id))
    .limit(1)

  const rechazado = sesion.user.status === 'rechazado' || sesion.user.status === 'suspendido'

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

      {rechazado ? (
        <>
          <h1 className="mt-7 font-titulo text-2xl">Acceso no habilitado</h1>
          <div className="mt-4">
            <Aviso nivel="alerta">
              {fila?.rejectionReason ??
                'Esta cuenta no tiene acceso a la aplicación. Si cree que es un error, escriba al profesional que le compartió el enlace.'}
            </Aviso>
          </div>
        </>
      ) : (
        <>
          <h1 className="mt-7 font-titulo text-2xl">Su solicitud esta pendiente</h1>
          <p className="mt-2 text-sm leading-relaxed text-grisMedio">
            Entró como <strong>{sesion.user.email}</strong>. El acceso a los datos clínicos es
            cerrado y lo aprueba un administrador. Le avisaremos al mismo correo cuando quede
            habilitado.
          </p>

          <form action={guardarNota} className="mt-6">
            <label className="etiqueta" htmlFor="nota">
              Cuentenos quien es, para aprobar mas rápido
            </label>
            <textarea
              id="nota"
              name="nota"
              rows={3}
              defaultValue={fila?.requestNote ?? ''}
              placeholder="Por ejemplo: optómetra, consultorio, ciudad. O: madre de un paciente en orto-k."
              className="campo resize-y"
            />
            <button type="submit" className="boton-secundario mt-3 w-full">
              Guardar
            </button>
          </form>
        </>
      )}

      <form
        action={async () => {
          'use server'
          await signOut({ redirectTo: '/' })
        }}
        className="mt-8"
      >
        <button type="submit" className="text-sm text-azul hover:underline">
          Cerrar sesión
        </button>
      </form>
    </main>
  )
}
