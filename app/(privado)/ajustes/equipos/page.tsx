import { asc, eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { biometers } from '@/lib/db/schema'
import { requerirAprobado } from '@/lib/auth/sesion'
import { desactivarEquipo } from '../../pacientes/acciones'
import { FormularioEquipo } from './FormularioEquipo'
import { Aviso } from '@/components/ui/Aviso'

export const metadata = { title: 'Equipos de biometría' }
export const dynamic = 'force-dynamic'

export default async function Equipos() {
  await requerirAprobado()
  const lista = await db.select().from(biometers).orderBy(asc(biometers.name))

  return (
    <>
      <h1 className="font-titulo text-2xl">Equipos de biometría</h1>
      <p className="mt-1 text-sm text-grisTexto">
        Cada control guarda con que equipo se midió la longitud axial. Si en un control se usa un
        equipo distinto al del control anterior, la ficha lo advierte.
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_1.2fr]">
        <section className="tarjeta h-fit">
          <h2 className="font-titulo text-lg">Agregar equipo</h2>
          <FormularioEquipo />
        </section>

        <section>
          <h2 className="font-titulo text-lg">Equipos registrados</h2>
          {lista.length === 0 ? (
            <div className="mt-3">
              <Aviso nivel="aviso">
                Todavía no hay equipos. Sin un equipo registrado no se puede guardar longitud
                axial en un control.
              </Aviso>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {lista.map((q) => (
                <li key={q.id} className="tarjeta flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{q.name}</p>
                    {q.serial && <p className="text-xs text-grisTexto">Serie {q.serial}</p>}
                  </div>
                  {q.active ? (
                    <form action={desactivarEquipo}>
                      <input type="hidden" name="id" value={q.id} />
                      <button type="submit" className="text-xs text-azul hover:underline">
                        Desactivar
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs text-grisTexto">Inactivo</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
