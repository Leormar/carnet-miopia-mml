import { desc } from 'drizzle-orm'

import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { requerirAdmin } from '@/lib/auth/sesion'
import { aprobarUsuario, rechazarUsuario, reactivarUsuario } from './acciones'
import { fechaLarga } from '@/lib/clinica/edad'

export const metadata = { title: 'Accesos' }
export const dynamic = 'force-dynamic'

const ETIQUETA_ESTADO: Record<string, { texto: string; clase: string }> = {
  pendiente: { texto: 'Pendiente', clase: 'bg-semAmarillo text-tinta' },
  aprobado: { texto: 'Aprobado', clase: 'bg-semVerde text-tinta' },
  rechazado: { texto: 'Rechazado', clase: 'bg-semRojo text-tinta' },
  suspendido: { texto: 'Suspendido', clase: 'bg-semRojo text-tinta' },
}

export default async function Aprobaciones() {
  await requerirAdmin()

  const todos = await db.select().from(users).orderBy(desc(users.createdAt))
  const pendientes = todos.filter((u) => u.status === 'pendiente')
  const resto = todos.filter((u) => u.status !== 'pendiente')

  return (
    <>
      <h1 className="font-titulo text-2xl">Accesos</h1>
      <p className="mt-1 text-sm text-grisTexto">
        El acceso a los datos clinicos es cerrado. Aqui se aprueba cada cuenta nueva.
      </p>

      <section className="mt-5">
        <h2 className="font-titulo text-lg">
          Pendientes{pendientes.length > 0 && ` (${pendientes.length})`}
        </h2>
        {pendientes.length === 0 ? (
          <p className="mt-2 text-sm text-grisTexto">No hay solicitudes pendientes.</p>
        ) : (
          <div className="mt-3 space-y-2.5">
            {pendientes.map((u) => (
              <div key={u.id} className="tarjeta">
                <p className="font-semibold">{u.name ?? 'Sin nombre'}</p>
                <p className="text-sm text-grisTexto">{u.email}</p>
                <p className="mt-0.5 text-xs text-grisTexto">
                  Solicito el {fechaLarga(u.createdAt)}
                </p>
                {u.requestNote && (
                  <p className="mt-2 rounded-mml bg-crema px-3 py-2 text-sm text-grisMedio">
                    {u.requestNote}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={aprobarUsuario} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="userId" value={u.id} />
                    <select name="perfil" className="campo w-auto py-1.5 text-sm">
                      <option value="profesional">Como profesional</option>
                      <option value="familia">Como familia</option>
                    </select>
                    <button
                      type="submit"
                      className="boton py-1.5 text-sm"
                      style={{ background: '#5a9a3a', color: '#fff' }}
                    >
                      Aprobar
                    </button>
                  </form>

                  <form action={rechazarUsuario} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="userId" value={u.id} />
                    <input
                      name="motivo"
                      placeholder="Motivo (opcional)"
                      className="campo w-auto py-1.5 text-sm"
                    />
                    <button type="submit" className="boton-secundario py-1.5 text-sm">
                      No aprobar
                    </button>
                  </form>
                </div>

                <p className="mt-2.5 text-xs leading-snug text-grisTexto">
                  Aprobar como profesional da acceso a crear pacientes y registrar controles.
                  Aprobar como familia solo habilita la cuenta; el acceso a un nino se concede
                  despues, paciente por paciente.
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-7">
        <h2 className="font-titulo text-lg">Todas las cuentas</h2>
        <div className="tarjeta mt-3 overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-borde bg-tinta text-xs uppercase tracking-wide text-white">
                <th className="px-3 py-2 font-semibold">Cuenta</th>
                <th className="px-3 py-2 font-semibold">Estado</th>
                <th className="px-3 py-2 font-semibold">Desde</th>
                <th className="px-3 py-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {resto.map((u) => {
                const et = ETIQUETA_ESTADO[u.status]
                return (
                  <tr key={u.id} className="border-b border-borde/60 last:border-0">
                    <td className="px-3 py-2">
                      <p className="font-medium">{u.name ?? 'Sin nombre'}</p>
                      <p className="text-xs text-grisTexto">{u.email}</p>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${et.clase}`}>
                        {et.texto}
                      </span>
                      {u.isAdmin && (
                        <span className="ml-1.5 text-xs font-semibold text-azul">admin</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-grisTexto">
                      {fechaLarga(u.createdAt)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {u.status !== 'aprobado' && (
                        <form action={reactivarUsuario}>
                          <input type="hidden" name="userId" value={u.id} />
                          <button type="submit" className="text-xs text-azul hover:underline">
                            Volver a pendiente
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
