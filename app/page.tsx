import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { Logo, BarrasMML } from '@/components/marca/Logo'
import { BotonGoogle } from '@/components/marca/BotonGoogle'
import { IconoReproducir } from '@/components/marca/IconosTratamiento'
import { CREDITO_FOTOS, FOTOS_TRATAMIENTO } from '@/config/fotos-tratamiento'
import {
  MiniAdherencia,
  MiniBiometria,
  MiniCalendario,
  MiniCarnet,
} from '@/components/marca/Miniaturas'
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
            El carnet de seguimiento del control de miopía, ahora en el teléfono. Registra el uso
            real del tratamiento junto al crecimiento del ojo, control tras control.
          </p>
          <p className="mt-3 max-w-2xl leading-relaxed text-grisTexto">
            Pensado para el seguimiento de ortoqueratología y para cualquier otro tratamiento que
            desacelere la miopía. Independiente de la marca: un mismo niño puede cambiar o combinar
            tratamientos sin perder su historia.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <BotonGoogle texto="Ingresar con Google" grande />
            <a
              href="#que-hace"
              className="inline-flex items-center justify-center rounded-xl border border-borde px-6 py-4 text-base font-semibold text-tinta transition hover:bg-white sm:w-auto"
            >
              Ver qué hace
            </a>
            <a
              href="#video"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-4 text-base font-semibold text-azul transition hover:bg-white"
            >
              <IconoReproducir className="h-5 w-5" />
              Ver el video
            </a>
          </div>
          <p className="mt-3 text-sm text-grisTexto">
            El acceso es cerrado. Cada cuenta nueva queda pendiente de aprobación de un
            administrador.
          </p>
        </div>
      </section>

      {/* Video */}
      <section id="video" className="scroll-mt-20 border-y border-borde/70 bg-white">
        <div className="mx-auto grid max-w-6xl gap-7 px-5 py-12 sm:py-16 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <figure className="overflow-hidden rounded-2xl border border-borde bg-crema shadow-elevada">
            <video
              className="block aspect-video w-full"
              controls
              preload="none"
              playsInline
              poster="/video/trailer-portada.jpg"
            >
              <source src="/video/trailer.mp4" type="video/mp4" />
              Su navegador no puede reproducir el video.
            </video>
          </figure>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-azul">
              Un minuto y catorce segundos
            </p>
            <h2 className="mt-2 font-titulo text-2xl sm:text-3xl">Qué es y cómo funciona</h2>
            <p className="mt-3 leading-relaxed text-grisMedio">
              El recorrido completo: qué registra la aplicación en cada control, cómo calcula el
              crecimiento del ojo, cómo se ve la adherencia al lado del resultado y cómo se
              comparte la historia con otro profesional sin perder el control de los datos.
            </p>
            <p className="mt-3 leading-relaxed text-grisTexto">
              Dura menos que explicarlo. Sirve para mostrárselo a una familia en consulta.
            </p>
          </div>
        </div>
      </section>

      {/* Tratamientos */}
      <section className="border-y border-borde/70 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <h2 className="font-titulo text-2xl sm:text-3xl">Cuatro tratamientos, un solo carnet</h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-grisMedio">
            Cada uno tiene su calendario de controles, su forma de registrar el uso y lo que hay
            que revisar en consulta. La aplicación los conoce todos y no obliga a elegir marca.
          </p>

          <div className="mt-7 space-y-4">
            {ORDEN_TRATAMIENTOS.map((tipo) => {
              const d = TRATAMIENTOS[tipo]
              const foto = FOTOS_TRATAMIENTO[tipo]
              const plantilla =
                PLANTILLAS_BASE.find((p) => p.tipo === tipo && p.clave.startsWith('wco-')) ??
                PLANTILLAS_BASE.find((p) => p.tipo === tipo)!
              const registro =
                d.modoRegistro === 'horas'
                  ? 'Horas de uso de cada día'
                  : d.modoRegistro === 'noche'
                    ? 'Si durmió con los lentes'
                    : 'Si se puso la gota'
              return (
                <article
                  key={tipo}
                  className="grid overflow-hidden rounded-2xl border border-borde bg-crema shadow-tarjeta sm:grid-cols-[240px_1fr]"
                >
                  {/* Foto del tratamiento. En el celular es una banda arriba. */}
                  <div className="relative h-40 sm:h-auto">
                    <Image
                      src={foto.src}
                      alt={foto.alt}
                      fill
                      sizes="(min-width: 640px) 240px, 100vw"
                      className="object-cover"
                      style={{ objectPosition: foto.encuadre }}
                    />
                    <span
                      className="absolute inset-x-0 bottom-0 h-1.5 sm:inset-y-0 sm:left-0 sm:bottom-auto sm:h-auto sm:w-1.5"
                      style={{ background: d.color }}
                      aria-hidden
                    />
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="font-titulo text-xl leading-tight">{d.nombre}</h3>
                      <span
                        className="pildora"
                        style={{ background: `${d.color}1f`, color: d.color }}
                      >
                        {registro}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-grisMedio">{d.queRevisar}</p>

                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-grisTexto">
                      Controles del primer año
                    </p>
                    <ol className="mt-2 flex flex-wrap items-center gap-1.5">
                      {plantilla.items.map((i, n) => (
                        <li key={i.etiqueta} className="flex items-center gap-1.5">
                          {n > 0 && (
                            <span className="h-px w-3" style={{ background: `${d.color}66` }} aria-hidden />
                          )}
                          <span
                            className="rounded-lg border bg-white px-2 py-1 text-xs font-semibold"
                            style={{ borderColor: `${d.color}4d`, color: d.color }}
                          >
                            {i.etiqueta}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </article>
              )
            })}
          </div>

          <p className="mt-5 text-sm text-grisTexto">
            Combinar no es un quinto tratamiento: es tener dos activos a la vez, por ejemplo
            orto-k más atropina, cada uno con su meta y su adherencia por separado.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-grisTexto">{CREDITO_FOTOS}</p>
        </div>
      </section>

      {/* Que hace */}
      <section id="que-hace" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-12 sm:py-16">
        <h2 className="font-titulo text-2xl sm:text-3xl">Qué hace la aplicación</h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              Mini: MiniBiometria,
              color: '#1fa3dd',
              titulo: 'Crecimiento del ojo',
              texto:
                'Longitud axial por ojo, crecimiento anualizado entre controles y de los últimos 12 meses. Avisa si el equipo de biometría cambió entre las dos medidas comparadas.',
            },
            {
              Mini: MiniAdherencia,
              color: '#e2104f',
              titulo: 'Adherencia visible',
              texto:
                'Porcentaje de días o noches cumplidos a 7, 30 y 90 días, y promedio de horas. La familia lo registra desde el teléfono con un botón grande.',
            },
            {
              Mini: MiniCalendario,
              color: '#5a9a3a',
              titulo: 'Calendario automático',
              texto:
                'Al iniciar el tratamiento se generan los controles del primer año, y después cada 6 meses. Los vencidos aparecen en el panel.',
            },
            {
              Mini: MiniCarnet,
              color: '#f5c400',
              titulo: 'Carnet en PDF',
              texto:
                'El mismo carnet de papel, con los datos ya impresos, listo para entregar a la familia y para llevar al oftalmólogo.',
            },
          ].map(({ Mini, color, titulo, texto }) => (
            <div key={titulo} className="overflow-hidden rounded-2xl border border-borde bg-white shadow-tarjeta">
              <div
                className="border-b border-borde/60 px-5 py-4"
                style={{ background: `${color}0f` }}
              >
                <Mini className="h-14 w-full" />
              </div>
              <div className="p-5">
              <h3 className="font-titulo text-lg leading-tight">{titulo}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-grisMedio">{texto}</p>
              </div>
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
            El semáforo compara el crecimiento medido con lo esperado para la edad del niño. Los
            umbrales viven en un archivo de configuración, con su fuente, y no están quemados en el
            código.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-semVerde p-5">
              <span className="inline-block h-3 w-3 rounded-full bg-verde" />
              <h3 className="mt-2 font-titulo text-lg">Verde</h3>
              <p className="mt-1 text-sm font-semibold text-tinta">Como un ojo sin miopía</p>
              <p className="mt-2 text-sm leading-relaxed text-grisMedio">
                Hasta 0,2 mm al año entre los 7 y los 10 años. Hasta 0,1 mm al año entre los 11 y
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
                Desde 0,3 mm al año entre los 7 y los 10. Desde 0,2 mm al año entre los 11 y los
                16.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-borde bg-crema p-5">
            <p className="font-titulo text-lg">
              Meta de largo plazo: longitud axial por debajo de {String(META_LONGITUD_AXIAL.limiteMm).replace('.', ',')} mm
            </p>
            <p className="mt-1 text-sm text-grisTexto">
              {META_LONGITUD_AXIAL.fuente}. Fuera de los 7 a los 16 años la aplicación muestra el
              dato medido sin clasificarlo, porque no hay umbral publicado para esas edades.
            </p>
          </div>
        </div>
      </section>

      {/* Evidencia */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <h2 className="font-titulo text-2xl sm:text-3xl">Por que el uso decide el resultado</h2>
        <p className="mt-2 max-w-2xl leading-relaxed text-grisMedio">
          Los porcentajes que se publican en los estudios se lograron con niños que usaron el
          dispositivo como se indicó. En la vida real, ese uso hay que construirlo.
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
                  'Optómetra u oftalmólogo. Crea pacientes, registra controles en menos de dos minutos y ve el panel con el semáforo, la adherencia de 30 días y los controles vencidos de todos sus pacientes.',
              },
              {
                titulo: 'Familia',
                color: '#e2104f',
                texto:
                  'Padre, madre o cuidador. Ve el carnet del niño, registra el uso de cada día desde el teléfono y sabe cuando es el próximo control. No edita datos clínicos.',
              },
              {
                titulo: 'Profesional invitado',
                color: '#5a9a3a',
                texto:
                  'Oftalmopediatría u otro colega. Acceso de solo lectura a un paciente, por enlace con vencimiento, que genera la familia o el profesional tratante.',
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
            Un niño puede tener más de un profesional tratante.
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
              aprobación: el acceso a los datos clínicos de menores es cerrado.
            </p>
            <div className="mt-7 w-full sm:w-auto">
              <BotonGoogle texto="Ingresar con Google" grande />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-white/55">
              Datos de salud de menores tratados conforme a la Ley 1581 de 2012 y el Decreto 1377
              de 2013. Consentimiento del padre, madre o representante al crear cada paciente, con
              registro de fecha y versión, y bitácora de auditoria de cada consulta.
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
            Este contenido es educativo y no reemplaza una valoración visual individual. La
            aplicación registra y calcula; no diagnostica ni decide tratamientos.
          </p>

          <p className="mt-4 text-sm">
            <Link href="/privacidad" className="text-azul hover:underline">
              Política de privacidad
            </Link>
            <span className="text-grisTexto"> · </span>
            <Link href="/terminos" className="text-azul hover:underline">
              Términos de uso
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
