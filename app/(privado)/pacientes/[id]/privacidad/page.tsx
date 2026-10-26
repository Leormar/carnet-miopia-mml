import Link from 'next/link'
import { notFound } from 'next/navigation'
import { desc, eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { auditLog, consents, users } from '@/lib/db/schema'
import { requerirAccesoAPaciente } from '@/lib/auth/sesion'
import { fichaDePaciente } from '@/lib/datos/pacientes'
import {
  archivarPaciente,
  restaurarPaciente,
  revocarConsentimiento,
  suprimirPaciente,
} from '../../acciones'
import { Aviso } from '@/components/ui/Aviso'
import { IconoVolver } from '@/components/marca/IconosTratamiento'
import { fechaCorta, fechaLarga } from '@/lib/clinica/edad'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Datos y consentimiento' }

const ACCION_EN_PALABRAS: Record<string, string> = {
  create: 'Creo',
  update: 'Modificó',
  delete: 'Borró',
  read: 'Consultó',
  export: 'Descargo una copia de',
  share: 'Compartió',
  revoke: 'Revocó un acceso de',
  login: 'Entró',
  approve: 'Aprobó',
}

export default async function Privacidad({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { error?: string }
}) {
  const { sesion } = await requerirAccesoAPaciente(params.id, ['profesional_tratante', 'familia'])
  const ficha = await fichaDePaciente(params.id)
  if (!ficha) notFound()

  const { paciente } = ficha
  const nombre = `${paciente.firstName} ${paciente.lastName}`.trim()
  const archivado = paciente.archivedAt !== null

  const autorizaciones = await db
    .select()
    .from(consents)
    .where(eq(consents.patientId, params.id))
    .orderBy(desc(consents.grantedAt))
  const vigente = autorizaciones.find((c) => c.revokedAt === null) ?? null

  const movimientos = await db
    .select({
      action: auditLog.action,
      entity: auditLog.entity,
      at: auditLog.at,
      actor: users.name,
      correo: users.email,
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.actorUserId, users.id))
    .where(eq(auditLog.patientId, params.id))
    .orderBy(desc(auditLog.at))
    .limit(30)

  return (
    <>
      <Link
        href={`/pacientes/${params.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-azul hover:underline"
      >
        <IconoVolver className="h-4 w-4" />
        {nombre}
      </Link>

      <h1 className="mt-2 font-titulo text-2xl">Datos y consentimiento</h1>
      <p className="mt-1 text-sm leading-relaxed text-grisTexto">
        Lo que el padre, la madre o el representante legal de {paciente.firstName} puede pedir en
        cualquier momento, y usted debe atender: una copia, una correccion, retirar la
        autorizacion o que se borren los datos. Ley 1581 de 2012 y Decreto 1377 de 2013.
      </p>

      {searchParams.error === 'confirmacion' && (
        <div className="mt-4">
          <Aviso nivel="alerta" titulo="No se suprimió nada">
            El nombre que escribio no coincide con {nombre}.
          </Aviso>
        </div>
      )}

      {archivado && (
        <div className="mt-4">
          <Aviso nivel="aviso" titulo="Paciente archivado">
            Archivado el {fechaLarga(paciente.archivedAt as Date)}. No aparece en el panel y no se
            deberian registrar datos nuevos. Los datos siguen guardados.
          </Aviso>
        </div>
      )}

      {/* Autorizacion */}
      <section className="mt-6">
        <h2 className="font-titulo text-lg">Autorización del representante legal</h2>
        {autorizaciones.length === 0 ? (
          <div className="mt-3">
            <Aviso nivel="alerta">
              No hay consentimiento registrado. No deberia haber datos de este niño en la
              aplicación sin la autorización de su representante legal.
            </Aviso>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {autorizaciones.map((c) => (
              <li key={c.id} className="tarjeta">
                <p className="font-semibold">
                  {c.guardianName}
                  {c.relationship && <span className="font-normal text-grisTexto"> · {c.relationship}</span>}
                </p>
                <p className="text-sm text-grisTexto">
                  Versión {c.version} · otorgado el {fechaLarga(c.grantedAt)} ·{' '}
                  {c.method === 'en_consulta' ? 'en consulta' : 'digital'}
                  {c.guardianDocument && ` · documento ${c.guardianDocument}`}
                </p>
                {c.revokedAt ? (
                  <p className="mt-1 text-sm font-semibold text-magenta">
                    Revocado el {fechaCorta(c.revokedAt)}
                  </p>
                ) : (
                  <p className="mt-1 text-sm font-semibold text-verde">Vigente</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Copia de los datos */}
      <section className="mt-6">
        <h2 className="font-titulo text-lg">Entregar una copia</h2>
        <div className="tarjeta mt-3">
          <p className="text-sm leading-relaxed text-grisMedio">
            Descarga todo lo que la aplicación guarda de {paciente.firstName}: datos de base,
            consentimientos, tratamientos, controles, citas y registros de uso. La version para
            leer e imprimir es el carnet.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`/pacientes/${params.id}/datos`}
              className="boton-secundario"
              download
            >
              Descargar todos los datos
            </a>
            <Link href={`/pacientes/${params.id}/carnet`} className="boton-secundario">
              Abrir el carnet
            </Link>
          </div>
          <p className="ayuda">La descarga queda registrada en la bitácora.</p>
        </div>
      </section>

      {/* Retirar la autorizacion */}
      {vigente && (
        <section className="mt-6">
          <h2 className="font-titulo text-lg">Retirar la autorización</h2>
          <form action={revocarConsentimiento.bind(null, params.id)} className="tarjeta mt-3 space-y-3">
            <p className="text-sm leading-relaxed text-grisMedio">
              Marca el consentimiento como revocado y archiva al paciente. No borra nada: deja
              constancia de que la familia retiro el permiso y de cuando lo hizo.
            </p>
            <input
              type="text"
              name="motivo"
              placeholder="Motivo, opcional"
              className="campo"
              aria-label="Motivo"
            />
            <button type="submit" className="boton-secundario">
              Revocar el consentimiento y archivar
            </button>
          </form>
        </section>
      )}

      {/* Archivar */}
      <section className="mt-6">
        <h2 className="font-titulo text-lg">Archivar</h2>
        <div className="tarjeta mt-3">
          <p className="text-sm leading-relaxed text-grisMedio">
            Saca al paciente del panel sin borrar nada, por ejemplo cuando termina el seguimiento.
            Se puede deshacer.
          </p>
          {archivado ? (
            <form action={restaurarPaciente.bind(null, params.id)} className="mt-3">
              <button type="submit" className="boton-secundario">
                Devolver al panel
              </button>
            </form>
          ) : (
            <form action={archivarPaciente.bind(null, params.id)} className="mt-3 space-y-3">
              <input
                type="text"
                name="motivo"
                placeholder="Motivo, opcional"
                className="campo"
                aria-label="Motivo"
              />
              <button type="submit" className="boton-secundario">
                Archivar
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Supresion */}
      <section className="mt-6">
        <h2 className="font-titulo text-lg">Suprimir definitivamente</h2>
        <div className="tarjeta mt-3 border-l-4 border-l-magenta">
          <p className="text-sm leading-relaxed text-grisMedio">
            Borra al paciente y, con el, sus controles, tratamientos, registros de uso, citas,
            accesos y enlaces compartidos. No se puede deshacer. En la bitácora queda que se
            suprimió, quien lo hizo y cuando, pero los datos clínicos no se recuperan.
          </p>
          <p className="mt-2 text-sm text-grisMedio">
            Antes de suprimir, confirme si existe un plazo legal de conservación de la historia
            clínica en el país donde se atendio al paciente.
          </p>

          {sesion.user.isAdmin ? (
            <form action={suprimirPaciente.bind(null, params.id)} className="mt-3 space-y-3">
              <div>
                <label className="etiqueta" htmlFor="confirmacion">
                  Escriba {nombre} para confirmar
                </label>
                <input
                  id="confirmacion"
                  name="confirmacion"
                  type="text"
                  required
                  autoComplete="off"
                  className="campo"
                />
              </div>
              <input
                type="text"
                name="motivo"
                placeholder="Motivo de la supresión"
                className="campo"
                aria-label="Motivo de la supresión"
              />
              <button type="submit" className="boton-magenta">
                Suprimir definitivamente
              </button>
            </form>
          ) : (
            <p className="mt-3 text-sm text-grisTexto">
              La supresión la ejecuta un administrador de la red. Pidasela, con el motivo.
            </p>
          )}
        </div>
      </section>

      {/* Bitacora */}
      <section className="mt-6">
        <h2 className="font-titulo text-lg">Quien ha tocado esta historia</h2>
        <p className="text-sm text-grisTexto">Últimos 30 movimientos. La bitácora no se edita ni se borra.</p>
        <div className="tarjeta mt-3 p-0">
          {movimientos.length === 0 ? (
            <p className="p-4 text-sm text-grisTexto">Sin movimientos.</p>
          ) : (
            <ul className="divide-y divide-borde/60 text-sm">
              {movimientos.map((m, i) => (
                <li key={i} className="flex flex-wrap items-baseline gap-x-2 px-4 py-2">
                  <span className="font-medium">{m.actor ?? m.correo ?? 'Enlace compartido'}</span>
                  <span className="text-grisMedio">
                    {(ACCION_EN_PALABRAS[m.action] ?? m.action).toLowerCase()} {m.entity}
                  </span>
                  <span className="ml-auto shrink-0 tabular-nums text-xs text-grisTexto">
                    {fechaCorta(m.at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}
