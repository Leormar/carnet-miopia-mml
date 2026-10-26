import Link from 'next/link'
import { redirect } from 'next/navigation'

import { requerirAprobado } from '@/lib/auth/sesion'
import { rolesDelUsuario } from '@/lib/datos/acceso'
import { filasDelPanel } from '@/lib/datos/pacientes'
import { PuntoSemaforo } from '@/components/marca/Semaforo'
import { IconoMas, IconoTratamiento } from '@/components/marca/IconosTratamiento'
import { TRATAMIENTOS } from '@/config/tratamientos'
import { fechaCorta } from '@/lib/clinica/edad'

export const metadata = { title: 'Pacientes' }
export const dynamic = 'force-dynamic'

function ColorAdherencia({ valor }: { valor: number | null }) {
  if (valor === null) return <span className="text-grisTexto">Sin registro</span>
  const color = valor >= 80 ? 'text-verde' : valor >= 50 ? 'text-amarillo' : 'text-magenta'
  return <span className={`font-semibold ${color}`}>{valor} %</span>
}

export default async function Panel() {
  const sesion = await requerirAprobado()

  // Una familia no tiene panel: va directo al carnet de su hijo.
  const roles = await rolesDelUsuario(sesion)
  if (roles.soloFamilia && roles.unicoPaciente) redirect(`/mi-carnet/${roles.unicoPaciente}`)

  const filas = await filasDelPanel(sesion)

  const vencidos = filas.filter((f) => f.controlesVencidos > 0)
  const enRojo = filas.filter((f) => f.semaforoColor === 'rojo')

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-titulo text-2xl">Pacientes</h1>
          <p className="text-sm text-grisTexto">
            {filas.length === 0
              ? 'Todavía no hay pacientes'
              : `${filas.length} ${filas.length === 1 ? 'paciente' : 'pacientes'}`}
            {vencidos.length > 0 && ` · ${vencidos.length} con controles vencidos`}
          </p>
        </div>
        <Link href="/pacientes/nuevo" className="boton-magenta ml-auto hidden sm:inline-flex">
          <IconoMas className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo paciente</span>
          <span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      {filas.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <div className="dato">
            <span className="dato-rotulo">Pacientes</span>
            <span className="dato-cifra">{filas.length}</span>
          </div>
          <div className="dato" style={{ borderColor: enRojo.length > 0 ? '#e2104f40' : undefined }}>
            <span className="dato-rotulo">En rojo</span>
            <span className={`dato-cifra ${enRojo.length > 0 ? 'text-magenta' : ''}`}>
              {enRojo.length}
            </span>
          </div>
          <div
            className="dato"
            style={{ borderColor: vencidos.length > 0 ? '#f5c40066' : undefined }}
          >
            <span className="dato-rotulo">Vencidos</span>
            <span className={`dato-cifra ${vencidos.length > 0 ? 'text-magenta' : ''}`}>
              {vencidos.length}
            </span>
          </div>
        </div>
      )}

      {filas.length === 0 ? (
        <div className="tarjeta mt-6 text-center">
          <p className="font-titulo text-lg">Empiece por el primer paciente</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-grisTexto">
            Al crear el paciente se registra el consentimiento del padre, madre o representante.
            Luego se abre el tratamiento, y con el se genera el calendario de controles.
          </p>
          <Link href="/pacientes/nuevo" className="boton-primario mt-4">
            Crear paciente
          </Link>
        </div>
      ) : (
        <div className="mt-5 space-y-2.5">
          {filas.map((f) => (
            <Link
              key={f.id}
              href={`/pacientes/${f.id}`}
              className="tarjeta-accion block hover:border-azul/50"
            >
              <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <PuntoSemaforo color={f.semaforoColor} titulo={f.semaforoTexto} />
                    <p className="truncate font-semibold">{f.nombre}</p>
                    <span className="shrink-0 text-sm text-grisTexto">{f.edad} años</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {f.tratamientosActivos.length === 0 ? (
                      <span className="text-xs text-grisTexto">Sin tratamiento activo</span>
                    ) : (
                      f.tratamientosActivos.map((t, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            color: TRATAMIENTOS[t.tipo].color,
                            background: `${TRATAMIENTOS[t.tipo].color}14`,
                          }}
                        >
                          <IconoTratamiento tipo={t.tipo} className="h-3.5 w-3.5" />
                          {TRATAMIENTOS[t.tipo].nombreCorto}
                          {t.etiqueta && ` · ${t.etiqueta}`}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <dl className="grid shrink-0 grid-cols-3 gap-x-5 gap-y-1 text-xs sm:text-sm">
                  <div>
                    <dt className="text-xs text-grisTexto">Crecimiento 12 m</dt>
                    <dd className="font-medium">{f.semaforoTexto}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-grisTexto">Adherencia 30 d</dt>
                    <dd>
                      <ColorAdherencia valor={f.adherencia30} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-grisTexto">Próximo control</dt>
                    <dd className="font-medium">
                      {f.controlesVencidos > 0 ? (
                        <span className="text-magenta">
                          {f.controlesVencidos} vencido{f.controlesVencidos > 1 ? 's' : ''}
                        </span>
                      ) : f.proximoControl ? (
                        fechaCorta(f.proximoControl.fecha)
                      ) : (
                        <span className="text-grisTexto">Sin programar</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
