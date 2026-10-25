import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { Logo, BarrasMML } from '@/components/marca/Logo'
import { BotonGoogle } from '@/components/marca/BotonGoogle'
import {
  IconoCalendario,
  IconoGrafica,
  IconoImprimir,
  IconoOjo,
  IconoTratamiento,
} from '@/components/marca/IconosTratamiento'
import { ORDEN_TRATAMIENTOS, TRATAMIENTOS } from '@/config/tratamientos'
import { PLANTILLAS_BASE } from '@/config/calendarios-control'
import { EVIDENCIA, REFERENCIAS_PORTADA } from '@/config/evidencia'
import { META_LONGITUD_AXIAL } from '@/config/umbrales-clinicos'
import { SITIO } from '@/config/sitio'

export default async function Inicio() {
  const sesion = await auth()
  if (sesion?.user?.status === 'aprobado') redirect('/panel')
  if (sesion?.user) redirect('/pendiente')

  return (
    <div className="min-h-screen bg-crema">
      {/* Barra superior */}
      <header className="sticky top-0 z-30 border-b border-borde/70 bg-crema/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3">
          <Logo tamano={36} />
          <div className="min-w-0">
            <p className="truncate font-titulo text-base leading-tight">{SITIO.nombreCorto}</p>
            <p className="hidden text-xs text-grisTexto sm:block">{SITIO.organizacion}</p>
          </div>
          <div className="ml-auto">
            <Link
              href="/ingresar"
              className="rounded-lg bg-tinta px-4 py-2 text-sm font-semibold text-white transition hover:bg-tinta/90"
            >
              Ingresar
            </Link>
          </div>
        </div>
      </header>

      {/* Portada */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, #1fa3dd 0, transparent 42%), radial-gradient(circle at 85% 10%, #e2104f 0, transparent 38%), radial-gradient(circle at 70% 85%, #5a9a3a 0, transparent 40%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-5 py-12 sm:py-20">
          <BarrasMML />
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-magenta">
            {SITIO.organizacion}
          </p>
          <h1 className="mt-2 max-w-3xl font-titulo text-[2.1rem] leading-[1.1] sm:text-5xl lg:text-6xl">
            Si no se usa, no funciona
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-grisMedio sm:text-xl">
            El carnet de seguimiento del control de miopia, ahora en el telefono. Registra el uso
            real del tratamiento junto al crecimiento del ojo, control tras control.
          </p>
          <p className="mt-3 max-w-2xl leading-relaxed text-grisTexto">
            Pensado para el seguimiento de ortoqueratologia y para cualquier otro tratamiento que
            desacelere la miopia. Independiente de la marca: un mismo nino puede cambiar o combinar
            tratamientos sin perder su historia.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <BotonGoogle texto="Ingresar con Google" grande />
            <a
              href="#que-hace"
              className="inline-flex items-center justify-center rounded-xl border border-borde px-6 py-4 text-base font-semibold text-tinta transition hover:bg-white sm:w-auto"
            >
              Ver que hace
            </a>
          </div>
          <p className="mt-3 text-sm text-grisTexto">
            El acceso es cerrado. Cada cuenta nueva queda pendiente de aprobacion de un
            administrador.
          </p>
        </div>
      </section>

      {/* Tratamientos */}
      <section className="border-y border-borde/70 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <h2 className="font-titulo text-2xl sm:text-3xl">Cuatro tratamientos, un solo carnet</h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-grisMedio">
            Cada uno tiene su calendario de controles, su forma de registrar el uso y lo que hay
            que revisar en consulta. La aplicacion los conoce todos y no obliga a elegir marca.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {ORDEN_TRATAMIENTOS.map((tipo) => {
              const d = TRATAMIENTOS[tipo]
              const plantilla =
                PLANTILLAS_BASE.find((p) => p.tipo === tipo && p.clave.startsWith('wco-')) ??
                PLANTILLAS_BASE.find((p) => p.tipo === tipo)!
              return (
                <article
                  key={tipo}
                  className="overflow-hidden rounded-2xl border border-borde bg-crema"
                  style={{ borderTop: `5px solid ${d.color}` }}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `${d.color}1a`, color: d.color }}
                      >
                        <IconoTratamiento tipo={tipo} className="h-5 w-5" />
                      </span>
                      <h3 className="font-titulo text-lg leading-tight">{d.nombre}</h3>
                    </div>

                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-grisTexto">
                      Controles del primer ano
                    </p>
                    <p className="mt-1 text-sm font-semibold" style={{ color: d.color }}>
                      {plantilla.items.map((i) => i.etiqueta).join(' · ')}
                    </p>

                    <p className="mt-3 text-sm leading-relaxed text-grisMedio">{d.queRevisar}</p>

                    <p className="mt-3 border-t border-borde pt-3 text-sm">
                      <span className="text-grisTexto">Se registra: </span>
                      <span className="font-semibold text-tinta">
                        {d.modoRegistro === 'horas'
                          ? 'horas de uso de cada dia'
                          : d.modoRegistro === 'noche'
                            ? 'si durmio con los lentes'
                            : 'si se puso la gota'}
                      </span>
                    </p>
                  </div>
                </article>
              )
            })}
          </div>

          <p className="mt-5 text-sm text-grisTexto">
            Combinar no es un quinto tratamiento: es tener dos activos a la vez, por ejemplo
            orto-k mas atropina, cada uno con su meta y su adherencia por separado.
          </p>
        </div>
      </section>

      {/* Que hace */}
      <section id="que-hace" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-12 sm:py-16">
        <h2 className="font-titulo text-2xl sm:text-3xl">Que hace la aplicacion</h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              Icono: IconoOjo,
              color: '#1fa3dd',
              titulo: 'Crecimiento del ojo',
              texto:
                'Longitud axial por ojo, crecimiento anualizado entre controles y de los ultimos 12 meses. Avisa si el equipo de biometria cambio entre las dos medidas comparadas.',
            },
            {
              Icono: IconoGrafica,
              color: '#e2104f',
              titulo: 'Adherencia visible',
              texto:
                'Porcentaje de dias o noches cumplidos a 7, 30 y 90 dias, y promedio de horas. La familia lo registra desde el telefono con un boton grande.',
            },
            {
              Icono: IconoCalendario,
              color: '#5a9a3a',
              titulo: 'Calendario automatico',
              texto:
                'Al iniciar el tratamiento se generan los controles del primer ano, y despues cada 6 meses. Los vencidos aparecen en el panel.',
            },
            {
              Icono: IconoImprimir,
              color: '#f5c400',
              titulo: 'Carnet en PDF',
              texto:
                'El mismo carnet de papel, con los datos ya impresos, listo para entregar a la familia y para llevar al oftalmologo.',
            },
          ].map(({ Icono, color, titulo, texto }) => (
            <div key={titulo} className="rounded-2xl border border-borde bg-white p-5">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `${color}1a`, color }}
              >
                <Icono className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-titulo text-lg leading-tight">{titulo}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-grisMedio">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Semaforo */}
      <section className="border-y border-borde/70 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <h2 className="font-titulo text-2xl sm:text-3xl">
            Como se lee el crecimiento en 12 meses
          </h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-grisMedio">
            El semaforo compara el crecimiento medido con lo esperado para la edad del nino. Los
            umbrales viven en un archivo de configuracion, con su fuente, y no estan quemados en el
            codigo.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-semVerde p-5">
              <span className="inline-block h-3 w-3 rounded-full bg-verde" />
              <h3 className="mt-2 font-titulo text-lg">Verde</h3>
              <p className="mt-1 text-sm font-semibold text-tinta">Como un ojo sin miopia</p>
              <p className="mt-2 text-sm leading-relaxed text-grisMedio">
                Hasta 0,2 mm al ano entre los 7 y los 10 anos. Hasta 0,1 mm al ano entre los 11 y
                los 16.
              </p>
            </div>
            <div className="rounded-2xl bg-semAmarillo p-5">
              <span className="inline-block h-3 w-3 rounded-full bg-amarillo" />
              <h3 className="mt-2 font-titulo text-lg">Amarillo</h3>
              <p className="mt-1 text-sm font-semibold text-tinta">Mas de lo ideal</p>
              <p className="mt-2 text-sm leading-relaxed text-grisMedio">
                Se acerca al crecimiento de un miope sin tratamiento. Es el momento de revisar
                adherencia y habitos antes de cambiar nada.
              </p>
            </div>
            <div className="rounded-2xl bg-semRojo p-5">
              <span className="inline-block h-3 w-3 rounded-full bg-magenta" />
              <h3 className="mt-2 font-titulo text-lg">Rojo</h3>
              <p className="mt-1 text-sm font-semibold text-tinta">
                Como un miope sin tratamiento
              </p>
              <p className="mt-2 text-sm leading-relaxed text-grisMedio">
                Desde 0,3 mm al ano entre los 7 y los 10. Desde 0,2 mm al ano entre los 11 y los
                16.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-borde bg-crema p-5">
            <p className="font-titulo text-lg">
              Meta de largo plazo: longitud axial por debajo de {String(META_LONGITUD_AXIAL.limiteMm).replace('.', ',')} mm
            </p>
            <p className="mt-1 text-sm text-grisTexto">
              {META_LONGITUD_AXIAL.fuente}. Fuera de los 7 a los 16 anos la aplicacion muestra el
              dato medido sin clasificarlo, porque no hay umbral publicado para esas edades.
            </p>
          </div>
        </div>
      </section>

      {/* Evidencia */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <h2 className="font-titulo text-2xl sm:text-3xl">Por que el uso decide el resultado</h2>
        <p className="mt-2 max-w-2xl leading-relaxed text-grisMedio">
          Los porcentajes que se publican en los estudios se lograron con ninos que usaron el
          dispositivo como se indico. En la vida real, ese uso hay que construirlo.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {EVIDENCIA.map((d) => (
            <div key={d.fuente} className="rounded-2xl border border-borde bg-white p-5">
              <p className="font-titulo text-4xl leading-none text-magenta">
                {d.cifra}
                <span className="ml-1 text-2xl text-grisTexto">{d.unidad}</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-grisMedio">{d.texto}</p>
              <p className="mt-3 border-t border-borde pt-2.5 text-xs text-grisTexto">
                {d.fuente}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Para quien */}
      <section className="border-y border-borde/70 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <h2 className="font-titulo text-2xl sm:text-3xl">Para quien</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {[
              {
                titulo: 'Profesional',
                color: '#1fa3dd',
                texto:
                  'Optometra u oftalmologo. Crea pacientes, registra controles en menos de dos minutos y ve el panel con el semaforo, la adherencia de 30 dias y los controles vencidos de todos sus pacientes.',
              },
              {
                titulo: 'Familia',
                color: '#e2104f',
                texto:
                  'Padre, madre o cuidador. Ve el carnet del nino, registra el uso de cada dia desde el telefono y sabe cuando es el proximo control. No edita datos clinicos.',
              },
              {
                titulo: 'Profesional invitado',
                color: '#5a9a3a',
                texto:
                  'Oftalmopediatria u otro colega. Acceso de solo lectura a un paciente, por enlace con vencimiento, que genera la familia o el profesional tratante.',
              },
            ].map((p) => (
              <div
                key={p.titulo}
                className="rounded-2xl border border-borde bg-crema p-5"
                style={{ borderLeft: `5px solid ${p.color}` }}
              >
                <h3 className="font-titulo text-lg">{p.titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-grisMedio">{p.texto}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-grisTexto">
            Un nino puede tener mas de un profesional tratante.
          </p>
        </div>
      </section>

      {/* Ingreso */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-tinta px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="mx-auto flex max-w-xl flex-col items-center">
            <div className="flex gap-[5px]" aria-hidden>
              {['#f5c400', '#5a9a3a', '#1fa3dd', '#e2104f'].map((c) => (
                <span key={c} className="block h-1 w-[26px]" style={{ background: c }} />
              ))}
            </div>
            <h2 className="mt-5 font-titulo text-3xl leading-tight text-white sm:text-4xl">
              Ingrese al carnet
            </h2>
            <p className="mt-3 leading-relaxed text-white/75">
              Entre con su cuenta de Google. Si es la primera vez, su solicitud queda pendiente de
              aprobacion: el acceso a los datos clinicos de menores es cerrado.
            </p>
            <div className="mt-7 w-full sm:w-auto">
              <BotonGoogle texto="Ingresar con Google" grande />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-white/55">
              Datos de salud de menores tratados conforme a la Ley 1581 de 2012 y el Decreto 1377
              de 2013. Consentimiento del padre, madre o representante al crear cada paciente, con
              registro de fecha y version, y bitacora de auditoria de cada consulta.
            </p>
          </div>
        </div>
      </section>

      {/* Pie */}
      <footer className="border-t border-borde/70 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="flex items-center gap-3">
            <Logo tamano={40} />
            <div>
              <p className="font-titulo text-base leading-tight">{SITIO.organizacion}</p>
              <p className="text-sm text-grisTexto">{SITIO.dominio}</p>
            </div>
          </div>

          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-grisMedio">
            Este contenido es educativo y no reemplaza una valoracion visual individual. La
            aplicacion registra y calcula; no diagnostica ni decide tratamientos.
          </p>

          <p className="mt-4 text-sm">
            <Link href="/privacidad" className="text-azul hover:underline">
              Politica de privacidad
            </Link>
            <span className="text-grisTexto"> · </span>
            <Link href="/terminos" className="text-azul hover:underline">
              Terminos de uso
            </Link>
          </p>

          <div className="mt-6 border-t border-borde pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-grisTexto">Fuentes</p>
            <ul className="mt-2 space-y-1">
              {REFERENCIAS_PORTADA.map((r) => (
                <li key={r} className="text-xs leading-relaxed text-grisTexto">
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 text-xs text-grisTexto">
            Autor clinico: {SITIO.autorClinico} ·{' '}
            <a
              href={`https://${SITIO.substack}`}
              className="text-azul hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {SITIO.substack}
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
