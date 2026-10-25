import Link from 'next/link'
import { desc, eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { professionalCredentials, users } from '@/lib/db/schema'
import { requerirAdmin } from '@/lib/auth/sesion'
import { rechazarCredencial, verificarCredencial } from './acciones'
import { IconoCandado } from '@/components/marca/IconosTratamiento'
import { Aviso } from '@/components/ui/Aviso'
import { fechaCorta } from '@/lib/clinica/edad'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Acreditaciones profesionales' }

const ESTADO = {
  pendiente: { texto: 'Por revisar', clase: 'text-amarillo' },
  verificada: { texto: 'Verificada', clase: 'text-verde' },
  rechazada: { texto: 'Rechazada', clase: 'text-magenta' },
} as const

export default async function Credenciales() {
  await requerirAdmin()

  const filas = await db
    .select({
      id: professionalCredentials.id,
      country: professionalCredentials.country,
      documentType: professionalCredentials.documentType,
      documentNumber: professionalCredentials.documentNumber,
      issuedBy: professionalCredentials.issuedBy,
      fileName: professionalCredentials.fileName,
      sizeBytes: professionalCredentials.sizeBytes,
      status: professionalCredentials.status,
      uploadedAt: professionalCredentials.uploadedAt,
      rejectionReason: professionalCredentials.rejectionReason,
      nombre: users.name,
      correo: users.email,
    })
    .from(professionalCredentials)
    .leftJoin(users, eq(professionalCredentials.userId, users.id))
    .orderBy(desc(professionalCredentials.uploadedAt))

  const porRevisar = filas.filter((f) => f.status === 'pendiente')

  return (
    <>
      <h1 className="font-titulo text-2xl">Acreditaciones profesionales</h1>
      <p className="mt-1 text-sm text-grisTexto">
        Documento con el que cada miembro de la red acredita que esta habilitado para ejercer en
        su pais. Abrir un documento queda en la bitacora.
      </p>

      {porRevisar.length > 0 && (
        <div className="mt-4">
          <Aviso nivel="aviso">
            {porRevisar.length} documento{porRevisar.length > 1 ? 's' : ''} por revisar.
          </Aviso>
        </div>
      )}

      {filas.length === 0 ? (
        <p className="mt-5 text-sm text-grisTexto">Todavia nadie ha subido su acreditacion.</p>
      ) : (
        <ul className="mt-5 space-y-2">
          {filas.map((f) => (
            <li key={f.id} className="tarjeta">
              <div className="flex flex-wrap items-start gap-3">
                <IconoCandado className="mt-0.5 h-5 w-5 shrink-0 text-grisTexto" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{f.nombre ?? f.correo}</p>
                  <p className="text-sm text-grisTexto">
                    {f.country} · {f.documentType}
                    {f.documentNumber && ` · numero ${f.documentNumber}`}
                  </p>
                  {f.issuedBy && (
                    <p className="text-sm text-grisTexto">Expedido por {f.issuedBy}</p>
                  )}
                  <p className="mt-0.5 text-xs text-grisTexto">
                    Subido el {fechaCorta(f.uploadedAt)} ·{' '}
                    <Link
                      href={`/admin/credenciales/${f.id}/archivo`}
                      className="text-azul hover:underline"
                      prefetch={false}
                    >
                      ver documento
                    </Link>{' '}
                    ({Math.round(f.sizeBytes / 1024)} KB)
                  </p>
                  {f.rejectionReason && (
                    <p className="mt-1 text-sm text-magenta">Motivo: {f.rejectionReason}</p>
                  )}
                </div>

                <span className={`shrink-0 text-sm font-semibold ${ESTADO[f.status].clase}`}>
                  {ESTADO[f.status].texto}
                </span>
              </div>

              {f.status !== 'verificada' && (
                <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-borde/60 pt-3">
                  <form action={verificarCredencial}>
                    <input type="hidden" name="id" value={f.id} />
                    <button type="submit" className="boton-secundario py-1.5 text-sm">
                      Verificar
                    </button>
                  </form>
                  <form action={rechazarCredencial} className="flex items-end gap-1.5">
                    <input type="hidden" name="id" value={f.id} />
                    <input
                      type="text"
                      name="motivo"
                      placeholder="Motivo del rechazo"
                      className="campo w-48 py-1.5 text-sm"
                      aria-label="Motivo del rechazo"
                    />
                    <button type="submit" className="boton-secundario py-1.5 text-sm">
                      Rechazar
                    </button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
