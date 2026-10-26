/**
 * Vista publica de solo lectura, abierta con el enlace o el QR que genera el
 * profesional tratante o la familia. No permite editar nada, vence y se puede
 * revocar. Cada apertura queda en la bitacora de auditoria.
 */

import type { Metadata } from 'next'

import { enlaceVigente, registrarApertura } from '@/lib/compartir/enlaces'
import { registrarAuditoria } from '@/lib/auditoria/registrar'
import { fichaDePaciente } from '@/lib/datos/pacientes'
import { TablaControles } from '@/components/paciente/TablaControles'
import { TarjetaSemaforo } from '@/components/marca/Semaforo'
import { BarraAdherencia } from '@/components/graficas/BarraAdherencia'
import { GraficaLongitudAxial } from '@/components/graficas/GraficaLongitudAxial'
import { GraficaRefraccion } from '@/components/graficas/GraficaRefraccion'
import { Aviso, NotaEducativa } from '@/components/ui/Aviso'
import { Logo, BarrasMML } from '@/components/marca/Logo'
import {
  IconoCalendario,
  IconoCandado,
  IconoTratamiento,
} from '@/components/marca/IconosTratamiento'
import { TRATAMIENTOS } from '@/config/tratamientos'
import { SITIO } from '@/config/sitio'
import { aFecha, edadEnAnos, fechaCorta, fechaLarga } from '@/lib/clinica/edad'
import { aNumero } from '@/lib/clinica/refraccion'
import { formatoMm } from '@/lib/clinica/crecimiento'
import { metaEnTexto } from '@/lib/clinica/adherencia'
import { etiquetaEstado } from '@/lib/clinica/calendario'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Carnet compartido',
  robots: { index: false, follow: false, nocache: true },
}

export default async function CarnetCompartido({ params }: { params: { token: string } }) {
  const enlace = await enlaceVigente(params.token)
  if (!enlace) return <EnlaceNoValido />

  const ficha = await fichaDePaciente(enlace.patientId)
  if (!ficha) return <EnlaceNoValido />

  await registrarApertura(enlace.id)
  await registrarAuditoria({
    actorUserId: null,
    action: 'read',
    entity: 'share_link',
    entityId: enlace.id,
    patientId: enlace.patientId,
    diff: { etiqueta: enlace.label },
  })

  const { paciente, controles, tratamientos, adherencia, citas, hoy } = ficha
  const ultimo = controles[controles.length - 1] ?? null
  const edad = edadEnAnos(paciente.birthDate, hoy)

  const vencidos = citas.filter((c) => c.estadoVigente === 'vencida')
  const proximas = citas.filter((c) => c.estadoVigente === 'pendiente').slice(0, 4)

  const cambioDeEquipo =
    ultimo?.doceMesesOd?.cambioDeEquipo || ultimo?.doceMesesOi?.cambioDeEquipo

  const datosAxial = controles
    .filter((c) => c.alOd !== null || c.alOi !== null)
    .map((c) => ({
      fecha: c.examDate,
      t: aFecha(c.examDate).getTime(),
      od: aNumero(c.alOd),
      oi: aNumero(c.alOi),
      equipo: c.biometerNombre,
    }))

  const datosRefraccion = controles
    .filter((c) => c.seOd !== null || c.seOi !== null)
    .map((c) => ({
      fecha: c.examDate,
      t: aFecha(c.examDate).getTime(),
      od: aNumero(c.seOd),
      oi: aNumero(c.seOi),
    }))

  const marcas = tratamientos.map((t) => ({
    t: aFecha(t.startDate).getTime(),
    fecha: t.startDate,
    tipo: t.type,
    etiqueta: TRATAMIENTOS[t.type].nombreCorto,
  }))

  return (
    <div className="min-h-screen bg-crema">
      <header className="border-b border-borde bg-crema/95">
        <div className="mx-auto flex max-w-5xl items-center gap-2.5 px-4 py-3">
          <Logo tamano={34} />
          <div className="min-w-0">
            <p className="font-titulo text-base leading-tight sm:text-lg">{SITIO.nombreCorto}</p>
            <p className="truncate text-xs text-grisTexto">{SITIO.organizacion}</p>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-2">
          <BarrasMML />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5 pb-16">
        <div className="tarjeta flex gap-2.5 border-l-4 border-l-azul">
          <IconoCandado className="mt-0.5 h-5 w-5 shrink-0 text-azul" />
          <div className="text-sm leading-snug">
            <p className="font-semibold">Vista de solo lectura</p>
            <p className="text-grisMedio">
              {enlace.label ? `Compartida con ${enlace.label}. ` : ''}
              Vence el {fechaLarga(enlace.expiresAt)}. Quien la comparte puede revocarla en
              cualquier momento.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <h1 className="font-titulo text-2xl">
            {paciente.firstName} {paciente.lastName}
          </h1>
          <p className="text-sm text-grisTexto">
            {edad} años · nació el {fechaLarga(paciente.birthDate)}
            {paciente.myopicParents !== null &&
              ` · ${paciente.myopicParents === 0 ? 'ningun padre miope' : paciente.myopicParents === 1 ? 'un padre miope' : 'dos padres miopes'}`}
            {paciente.myopiaOnsetAge &&
              ` · miopia desde los ${String(paciente.myopiaOnsetAge).replace('.', ',')} anos`}
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {vencidos.length > 0 && (
            <Aviso
              nivel="alerta"
              titulo={`${vencidos.length} control${vencidos.length > 1 ? 'es' : ''} vencido${vencidos.length > 1 ? 's' : ''}`}
            >
              {vencidos.map((c) => `${c.label} (${fechaCorta(c.dueDate)})`).join(' · ')}
            </Aviso>
          )}
          {ultimo?.avisoAxial && <Aviso nivel={ultimo.avisoAxial.nivel}>{ultimo.avisoAxial.texto}</Aviso>}
          {cambioDeEquipo && (
            <Aviso nivel="aviso" titulo="Cambio de equipo de biometría">
              Los dos controles comparados se midieron con equipos distintos. La diferencia puede
              no ser solo crecimiento del ojo.
            </Aviso>
          )}
        </div>

        <section className="mt-5">
          <h2 className="font-titulo text-lg">Crecimiento del ojo</h2>
          {ultimo ? (
            <>
              <p className="text-sm text-grisTexto">
                Ultimo control: {fechaLarga(ultimo.examDate)}
                {ultimo.biometerNombre && ` · ${ultimo.biometerNombre}`}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <TarjetaSemaforo titulo="OD, 12 meses" semaforo={ultimo.semaforoOd} />
                <TarjetaSemaforo titulo="OI, 12 meses" semaforo={ultimo.semaforoOi} />
              </div>
              {(ultimo.entreControlesOd || ultimo.entreControlesOi) && (
                <p className="mt-2 text-xs text-grisTexto">
                  Entre los dos ultimos controles:
                  {ultimo.entreControlesOd &&
                    ` OD ${formatoMm(ultimo.entreControlesOd.mmPorAno)} mm/ano`}
                  {ultimo.entreControlesOi &&
                    ` · OI ${formatoMm(ultimo.entreControlesOi.mmPorAno)} mm/ano`}
                </p>
              )}
            </>
          ) : (
            <p className="mt-1 text-sm text-grisTexto">Todavía no hay controles registrados.</p>
          )}
        </section>

        {adherencia.length > 0 && (
          <section className="mt-6">
            <h2 className="font-titulo text-lg">Uso del tratamiento</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {adherencia.map((a) => (
                <div key={a.tratamiento.id} className="tarjeta">
                  <div className="flex items-center gap-2">
                    <IconoTratamiento tipo={a.tratamiento.type} className="h-4 w-4" />
                    <p className="font-semibold">{TRATAMIENTOS[a.tratamiento.type].nombre}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-grisTexto">
                    Meta:{' '}
                    {metaEnTexto({
                      id: a.tratamiento.id,
                      type: a.tratamiento.type,
                      startDate: a.tratamiento.startDate,
                      endDate: a.tratamiento.endDate,
                      adherenceGoal: a.tratamiento.adherenceGoal,
                    })}
                  </p>
                  <div className="mt-3">
                    <BarraAdherencia resumen={a.treinta} titulo="30 dias" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6">
          <h2 className="font-titulo text-lg">Longitud axial</h2>
          <div className="tarjeta mt-3">
            <GraficaLongitudAxial datos={datosAxial} marcas={marcas} />
          </div>
        </section>

        <section className="mt-6">
          <h2 className="font-titulo text-lg">Refracción</h2>
          <div className="tarjeta mt-3">
            <GraficaRefraccion
              datos={datosRefraccion}
              marcas={marcas.map((m) => ({ t: m.t, tipo: m.tipo }))}
            />
          </div>
        </section>

        <section className="mt-6">
          <h2 className="font-titulo text-lg">Tratamientos</h2>
          <div className="mt-3 space-y-2">
            {tratamientos.length === 0 && (
              <p className="text-sm text-grisTexto">Sin tratamientos registrados.</p>
            )}
            {tratamientos.map((t) => {
              const d = TRATAMIENTOS[t.type]
              return (
                <div key={t.id} className="tarjeta border-l-4" style={{ borderLeftColor: d.color }}>
                  <div className="flex flex-wrap items-start gap-2">
                    <IconoTratamiento tipo={t.type} className="mt-0.5 h-5 w-5" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">
                        {d.nombre}
                        {t.concentration && ` ${t.concentration}`}
                      </p>
                      <p className="text-sm text-grisTexto">
                        Desde {fechaCorta(t.startDate)}
                        {t.endDate ? ` hasta ${fechaCorta(t.endDate)}` : ' · activo'}
                        {t.deviceLabel && ` · ${t.deviceLabel}`}
                      </p>
                      {t.changeReason && (
                        <p className="mt-0.5 text-sm text-grisMedio">
                          Motivo de cambio: {t.changeReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="font-titulo text-lg">Próximos controles</h2>
          <div className="tarjeta mt-3">
            {[...vencidos, ...proximas].length === 0 ? (
              <p className="text-sm text-grisTexto">No hay controles programados.</p>
            ) : (
              <ul className="divide-y divide-borde/60 text-sm">
                {[...vencidos, ...proximas].map((c) => (
                  <li key={c.id} className="flex items-center gap-2 py-2 first:pt-0 last:pb-0">
                    <IconoCalendario
                      className={`h-4 w-4 shrink-0 ${c.estadoVigente === 'vencida' ? 'text-magenta' : 'text-grisTexto'}`}
                    />
                    <span className="min-w-0 flex-1 truncate">{c.label}</span>
                    <span className="shrink-0 tabular-nums text-grisTexto">
                      {fechaCorta(c.dueDate)}
                    </span>
                    <span
                      className={`shrink-0 text-xs font-semibold ${c.estadoVigente === 'vencida' ? 'text-magenta' : 'text-grisTexto'}`}
                    >
                      {etiquetaEstado(c.estadoVigente)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="font-titulo text-lg">Controles</h2>
          <TablaControles controles={controles} />
        </section>

        <div className="mt-6">
          <NotaEducativa />
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-10 text-xs leading-relaxed text-grisTexto">
        <p>
          La aplicación registra y calcula; no diagnostica ni decide tratamientos. Esta vista es
          de solo lectura y su apertura queda registrada en la bitácora de auditoria, conforme a
          la Ley 1581 de 2012 y al Decreto 1377 de 2013.
        </p>
        <p className="mt-1">
          {SITIO.organizacion} · {SITIO.dominio}
        </p>
      </footer>
    </div>
  )
}

function EnlaceNoValido() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-crema px-4 py-12">
      <Logo tamano={56} />
      <h1 className="mt-4 text-center font-titulo text-2xl">Este enlace ya no sirve</h1>
      <p className="mt-2 max-w-md text-center text-sm leading-relaxed text-grisTexto">
        El enlace vencio, fue revocado o no es correcto. Pida uno nuevo al profesional tratante o
        a la familia del paciente: lo pueden generar en un momento desde el carnet.
      </p>
      <div className="mt-5">
        <BarrasMML />
      </div>
      <p className="mt-5 text-xs text-grisTexto">
        {SITIO.organizacion} · {SITIO.dominio}
      </p>
    </div>
  )
}
