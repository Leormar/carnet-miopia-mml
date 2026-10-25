import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { Logo, BarrasMML } from '@/components/marca/Logo'
import { IconoOjo, IconoCalendario, IconoGrafica } from '@/components/marca/IconosTratamiento'
import { SITIO } from '@/config/sitio'

export default async function Inicio() {
  const sesion = await auth()
  if (sesion?.user?.status === 'aprobado') redirect('/panel')
  if (sesion?.user) redirect('/pendiente')

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-10">
      <header className="flex items-center gap-3">
        <Logo />
        <div>
          <p className="font-titulo text-lg leading-tight">{SITIO.organizacion}</p>
          <p className="text-sm text-grisTexto">{SITIO.dominio}</p>
        </div>
      </header>
      <BarrasMML className="mt-3" />

      <h1 className="mt-8 font-titulo text-3xl leading-tight sm:text-4xl">
        Carnet de seguimiento del control de miopia
      </h1>
      <p className="mt-3 max-w-xl text-lg leading-relaxed text-grisMedio">
        El carnet de papel del Grupo Manejo Miopia Latam, ahora en el telefono. Registra el uso
        real del tratamiento junto al crecimiento del ojo, control tras control.
      </p>
      <p className="mt-3 max-w-xl leading-relaxed text-grisMedio">
        Pensado para el seguimiento de ortoqueratologia y para cualquier otro tratamiento de
        control de miopia: gafas, lentes blandos y atropina en baja dosis. Independiente de la
        marca, para que un mismo nino pueda cambiar o combinar tratamientos sin perder su historia.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { Icono: IconoOjo, titulo: 'Longitud axial', texto: 'Crecimiento anualizado por ojo y semaforo por edad.' },
          { Icono: IconoGrafica, titulo: 'Adherencia', texto: 'Noches de lentes, horas de uso y gotas, a 7, 30 y 90 dias.' },
          { Icono: IconoCalendario, titulo: 'Controles', texto: 'Calendario del primer ano generado al iniciar el tratamiento.' },
        ].map(({ Icono, titulo, texto }) => (
          <div key={titulo} className="tarjeta">
            <Icono className="h-5 w-5 text-azul" />
            <p className="mt-2 font-semibold">{titulo}</p>
            <p className="mt-1 text-sm leading-snug text-grisTexto">{texto}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link href="/ingresar" className="boton-primario">
          Ingresar
        </Link>
        <p className="mt-3 text-sm text-grisTexto">
          El acceso es cerrado. Cada cuenta nueva queda pendiente de aprobacion.
        </p>
      </div>

      <footer className="mt-auto pt-10 text-xs text-grisTexto">
        <p>
          Este contenido es educativo y no reemplaza una valoracion visual individual. La
          aplicacion registra y calcula; no diagnostica ni decide tratamientos.
        </p>
        <p className="mt-1">
          {SITIO.autorClinico} · {SITIO.substack}
        </p>
      </footer>
    </main>
  )
}
