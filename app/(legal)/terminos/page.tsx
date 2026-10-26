import Link from 'next/link'

import { SITIO } from '@/config/sitio'
import { LEGAL } from '@/config/legal'

export const metadata = {
  title: 'Términos de uso',
  description:
    'Condiciones de uso del carnet de seguimiento del control de miopía del Grupo Manejo Miopía Latam.',
  robots: { index: true, follow: true },
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="font-titulo text-xl">{titulo}</h2>
      <div className="mt-2 space-y-3 text-[15.5px] leading-relaxed text-grisMedio">{children}</div>
    </section>
  )
}

export default function Terminos() {
  return (
    <>
      <h1 className="font-titulo text-3xl">Términos de uso</h1>
      <p className="mt-1 text-sm text-grisTexto">
        Versión {LEGAL.version} · {LEGAL.fecha}
      </p>

      <Seccion titulo="Que es esto">
        <p>
          {SITIO.dominio} es el carnet de seguimiento del control de miopía del{' '}
          {LEGAL.responsable}. Sirve para que el profesional y la familia registren los controles
          del nino, vean si el ojo está creciendo dentro de lo esperado y sostengan el uso del
          tratamiento. Es independiente de marca y no promueve ningun dispositivo.
        </p>
      </Seccion>

      <Seccion titulo="Quien puede usarla">
        <p>
          El acceso es cerrado. Pueden usarla los profesionales de la salud visual habilitados para
          ejercer en su país, que hayan sido aprobados por un administrador de la red, hayan
          firmado el compromiso de manejo de información y hayan acreditado su habilitación. Y las
          familias a las que el profesional invita para seguir a su hijo.
        </p>
        <p>
          Si su habilitación profesional se vence, se suspende o cambia de país, debe actualizarla
          en la aplicación. La red puede suspender un acceso cuando la acreditación no se sostiene
          o cuando se incumple el compromiso.
        </p>
      </Seccion>

      <Seccion titulo="La aplicación no decide por usted">
        <p>
          La aplicación <b>registra y calcula; no diagnostica ni decide tratamientos</b>. Los
          calculos de crecimiento, el semáforo y los textos de sugerencia son informativos y no
          reemplazan el criterio del profesional ni una valoración visual individual.
        </p>
        <p>
          La responsabilidad clínica de cada decisión es del profesional tratante, que es quien
          conoce al paciente.
        </p>
      </Seccion>

      <Seccion titulo="A que se compromete quien entra">
        <p>
          A pedir la autorización del representante legal antes de crear la historia de un niño. A
          entrar solo a las historias de los pacientes que atiende. A no compartir su usuario ni
          dejar la sesión abierta en un equipo compartido. A compartir información con otro
          profesional solo por el enlace de solo lectura de la aplicación, que vence y se puede
          revocar. Y a avisar de inmediato si sospecha un acceso no autorizado.
        </p>
        <p>
          Esta prohibido usar la aplicación para fines distintos del seguimiento clínico, extraer
          datos de forma masiva, intentar acceder a historias ajenas o suplantar a otro
          profesional.
        </p>
      </Seccion>

      <Seccion titulo="Los datos son del paciente">
        <p>
          Los datos de cada nino pertenecen a su titular. La familia puede pedir en cualquier
          momento una copia completa, su correccion, el retiro de la autorizacion o su supresion.
          Como se hace esta en la{' '}
          <Link href="/privacidad" className="text-azul hover:underline">
            política de privacidad
          </Link>
          .
        </p>
      </Seccion>

      <Seccion titulo="Disponibilidad">
        <p>
          La aplicación se ofrece tal como está, sin garantía de disponibilidad ininterrumpida. Se
          hacen copias de seguridad, pero el profesional no debe depender de ella como unico
          registro clínico cuando la norma de su país le exige llevar historia clínica formal.
        </p>
      </Seccion>

      <Seccion titulo="Costo">
        <p>
          El uso es gratuito para los miembros de la red. Si eso cambia, se avisara con
          anticipación y nunca se cobrara por recuperar los datos ya registrados.
        </p>
      </Seccion>

      <Seccion titulo="Cambios y contacto">
        <p>
          Estos terminos pueden cambiar; la version y la fecha quedan arriba. Para cualquier
          consulta, escriba a <b>{LEGAL.correoDatos}</b>.
        </p>
      </Seccion>

      <p className="mt-8 text-xs text-grisTexto">
        Este contenido es educativo y no reemplaza una valoración visual individual.
      </p>
    </>
  )
}
