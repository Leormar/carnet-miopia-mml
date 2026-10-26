import Link from 'next/link'
import { notFound } from 'next/navigation'

import { requerirAccesoAPaciente } from '@/lib/auth/sesion'
import { fichaDePaciente } from '@/lib/datos/pacientes'
import { enlacesDePaciente, type EstadoEnlace } from '@/lib/compartir/enlaces'
import { FormularioEnlace } from './FormularioEnlace'
import { revocarEnlaceCompartido } from '../../acciones'
import { Aviso } from '@/components/ui/Aviso'
import { IconoCandado, IconoVolver } from '@/components/marca/IconosTratamiento'
import { fechaCorta, fechaLarga } from '@/lib/clinica/edad'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Compartir con otro profesional' }

const ESTADO: Record<EstadoEnlace, { texto: string; clase: string }> = {
  vigente: { texto: 'Vigente', clase: 'text-verde' },
  vencido: { texto: 'Vencido', clase: 'text-grisTexto' },
  revocado: { texto: 'Revocado', clase: 'text-magenta' },
}

export default async function Compartir({ params }: { params: { id: string } }) {
  await requerirAccesoAPaciente(params.id, ['profesional_tratante', 'familia'])
  const ficha = await fichaDePaciente(params.id)
  if (!ficha) notFound()

  const enlaces = await enlacesDePaciente(params.id)
  const nombre = `${ficha.paciente.firstName} ${ficha.paciente.lastName}`.trim()

  return (
    <>
      <Link
        href={`/pacientes/${params.id}`}
        className="no-imprimir inline-flex items-center gap-1.5 text-sm text-azul hover:underline"
      >
        <IconoVolver className="h-4 w-4" />
        {nombre}
      </Link>

      <div className="no-imprimir mt-2">
        <h1 className="font-titulo text-2xl">Compartir con otro profesional</h1>
        <p className="mt-1 text-sm leading-relaxed text-grisTexto">
          Genera un enlace y un código QR de solo lectura para que oftalmología pediátrica, u
          otro profesional, vea el seguimiento de {ficha.paciente.firstName} sin necesidad de
          crear una cuenta. Quien lo abra puede ver y no puede modificar nada.
        </p>
      </div>

      <section className="no-imprimir mt-4">
        <h2 className="font-titulo text-lg">Qué verá quien lo reciba</h2>
        <ul className="mt-2 space-y-1 text-sm text-grisMedio">
          <li>Datos de base del paciente y sus tratamientos, con las fechas de inicio.</li>
          <li>Crecimiento del ojo en 12 meses con el semáforo, y las gráficas de longitud axial y refracción.</li>
          <li>La tabla de controles y los próximos controles programados.</li>
          <li>La adherencia de los últimos 30 días de cada tratamiento activo.</li>
        </ul>
        <p className="mt-2 text-sm text-grisTexto">
          No verá el registro diario de uso ni los datos de contacto de la familia, y no podrá
          registrar nada.
        </p>
      </section>

      <section className="mt-5">
        <h2 className="no-imprimir font-titulo text-lg">Nuevo enlace</h2>
        <FormularioEnlace patientId={params.id} nombrePaciente={nombre} />
      </section>

      <section className="no-imprimir mt-6">
        <h2 className="font-titulo text-lg">Enlaces de este paciente</h2>

        {enlaces.length === 0 ? (
          <p className="mt-2 text-sm text-grisTexto">Todavía no se ha compartido este carnet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {enlaces.map((e) => (
              <li key={e.id} className="tarjeta">
                <div className="flex flex-wrap items-start gap-3">
                  <IconoCandado className="mt-0.5 h-5 w-5 shrink-0 text-grisTexto" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{e.label ?? 'Sin nombre'}</p>
                    <p className="text-sm text-grisTexto">
                      Creado el {fechaCorta(e.createdAt)} ·{' '}
                      {e.estado === 'revocado'
                        ? `revocado el ${fechaCorta(e.revokedAt as Date)}`
                        : `vence el ${fechaLarga(e.expiresAt)}`}
                    </p>
                    <p className="mt-0.5 text-xs text-grisTexto">
                      {e.useCount === 0
                        ? 'Sin aperturas'
                        : `${e.useCount} apertura${e.useCount > 1 ? 's' : ''}` +
                          (e.lastUsedAt ? `, la ultima el ${fechaCorta(e.lastUsedAt)}` : '')}
                    </p>
                  </div>
                  <span className={`shrink-0 text-sm font-semibold ${ESTADO[e.estado].clase}`}>
                    {ESTADO[e.estado].texto}
                  </span>
                  {e.estado === 'vigente' && (
                    <form action={revocarEnlaceCompartido.bind(null, params.id)}>
                      <input type="hidden" name="shareLinkId" value={e.id} />
                      <button type="submit" className="boton-secundario py-1.5 text-sm">
                        Revocar
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="no-imprimir mt-6">
        <Aviso titulo="Tratamiento de datos">
          Son datos de salud de un menor. Comparta el enlace solo con el profesional que lo
          necesita, por un medio privado, y revóquelo cuando ya no haga falta. Cada apertura
          queda registrada en la bitácora de auditoría, conforme a la Ley 1581 de 2012 y al
          Decreto 1377 de 2013.
        </Aviso>
      </div>
    </>
  )
}
