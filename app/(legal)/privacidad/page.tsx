import { Aviso } from '@/components/ui/Aviso'
import { SITIO } from '@/config/sitio'
import { LEGAL } from '@/config/legal'

export const metadata = {
  title: 'Política de privacidad',
  description:
    'Como el Grupo Manejo Miopía Latam trata los datos personales y de salud en el carnet de seguimiento del control de miopía.',
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

export default function Privacidad() {
  return (
    <>
      <h1 className="font-titulo text-3xl">Política de privacidad</h1>
      <p className="mt-1 text-sm text-grisTexto">
        Versión {LEGAL.version} · {LEGAL.fecha}
      </p>

      <div className="mt-5">
        <Aviso nivel="aviso" titulo="Datos de salud de menores de edad">
          Esta aplicación trata datos sensibles de niños. Nada se registra sin la autorización
          previa, expresa e informada del padre, la madre o el representante legal.
        </Aviso>
      </div>

      <Seccion titulo="Quien responde por estos datos">
        <p>
          El responsable del tratamiento es el <b>{LEGAL.responsable}</b>, que opera la aplicacion
          en {SITIO.dominio}. Para cualquier solicitud sobre sus datos o los de su hijo, escriba a{' '}
          <b>{LEGAL.correoDatos}</b>.
        </p>
        <p>
          El profesional que atiende al niño registra los datos dentro de la aplicación y es quien
          mantiene la relación clínica con la familia.
        </p>
      </Seccion>

      <Seccion titulo="Que datos se tratan">
        <p>
          <b>Del niño.</b> Nombre, fecha de nacimiento, sexo, documento de identidad si la familia
          lo aporta, edad de inicio de la miopía, cuantos padres son miopes, agudeza visual,
          refracción bajo cicloplejía, longitud axial del ojo, equipo con que se midio, tratamiento
          y dispositivo, registro diario de uso, molestias, hallazgos de cada control y fechas de
          los próximos controles.
        </p>
        <p>
          <b>De la familia.</b> Nombre de quien autoriza, su documento, su parentesco y sus datos
          de contacto cuando el profesional los registra.
        </p>
        <p>
          <b>Del profesional.</b> Nombre, correo, país donde ejerce y el documento con el que
          acredita su habilitación profesional.
        </p>
        <p>
          <b>Técnicos.</b> Fecha, hora, dirección IP y navegador de cada acceso, creación,
          modificación, consulta, descarga o compartido de una historia. Son la bitácora de
          auditoria y no se pueden borrar ni editar.
        </p>
      </Seccion>

      <Seccion titulo="Para que se usan">
        <p>
          Para registrar el seguimiento del tratamiento que desacelera la miopía, calcular cuanto
          creció el ojo, hacer visible cuanto se usa el dispositivo, programar los controles y
          permitir que el profesional comparta el seguimiento con oftalmología pediátrica cuando la
          familia lo autoriza.
        </p>
        <p>
          La aplicación registra y calcula. No diagnostica ni decide tratamientos: la decisión
          clínica siempre es del profesional.
        </p>
        <p>
          Los datos <b>no se venden, no se ceden a fabricantes de dispositivos y no se usan con
          fines comerciales ni publicitarios</b>.
        </p>
      </Seccion>

      <Seccion titulo="Con que autorización">
        <p>
          Con la autorización previa, expresa e informada del padre, la madre o el representante
          legal, recogida por el profesional antes de crear la historia del niño. De cada
          autorización queda su versión, la fecha, quien la otorgó y con que documento. Sin esa
          autorización la aplicación no permite registrar nada.
        </p>
        <p>
          La autorizacion se puede retirar en cualquier momento, sin dar explicaciones, escribiendo
          a {LEGAL.correoDatos} o pidiendoselo al profesional tratante.
        </p>
      </Seccion>

      <Seccion titulo="Quien puede verlos">
        <p>
          <b>El profesional tratante</b> del niño, y solo las historias de los pacientes que
          atiende. <b>La familia</b>, el carnet de su hijo y el registro diario de uso.{' '}
          <b>Un profesional invitado</b>, por ejemplo oftalmología pediátrica, cuando el
          profesional o la familia genera un enlace de solo lectura: ese enlace vence, se puede
          revocar en cualquier momento y cada apertura queda registrada.
        </p>
        <p>
          <b>Los administradores</b> de la red, para aprobar solicitudes de acceso y verificar
          acreditaciones profesionales.
        </p>
        <p>
          El acceso es cerrado: nadie entra sin que un administrador apruebe su solicitud, y quien
          ejerce debe acreditar su habilitación profesional y firmar un compromiso de manejo de
          información.
        </p>
      </Seccion>

      <Seccion titulo="Donde se guardan">
        <p>
          En los servidores de {LEGAL.alojamiento.proveedores}, en la region{' '}
          {LEGAL.alojamiento.region}. Es decir, los datos se almacenan fuera de Colombia, lo que
          constituye una transferencia internacional. La autorizacion del representante legal
          comprende ese almacenamiento.
        </p>
        <p>La información viaja cifrada y los secretos de acceso nunca se guardan en el código.</p>
      </Seccion>

      <Seccion titulo="Cuanto tiempo se conservan">
        <p>
          Mientras dure el seguimiento del niño, y después hasta que el representante legal pida su
          supresión. Al pedirla, la aplicación borra la historia completa: controles, tratamientos,
          registros de uso, citas, accesos y enlaces compartidos.
        </p>
        <p>
          El profesional tratante puede estar obligado por la norma de su país a conservar la
          historia clínica por un plazo determinado. En ese caso prevalece esa obligación, y el
          profesional debe informarselo a la familia.
        </p>
      </Seccion>

      <Seccion titulo="Sus derechos y como ejercerlos">
        <p>
          Como titular, o como su representante legal, usted puede conocer, actualizar y rectificar
          los datos; pedir prueba de la autorizacion; ser informado del uso que se les ha dado;
          presentar quejas ante la {LEGAL.autoridad}; revocar la autorizacion; y pedir la supresion
          de los datos.
        </p>
        <p>
          Dentro de la aplicación, cada paciente tiene una pagina donde el profesional puede, en el
          momento: <b>descargar una copia completa</b> de todos los datos, <b>retirar la
          autorización</b>, <b>archivar</b> al paciente y <b>solicitar la supresión definitiva</b>.
        </p>
        <p>
          Si prefiere escribir, hagalo a <b>{LEGAL.correoDatos}</b>. Indique el nombre del niño, su
          parentesco y que necesita. Responderemos a la dirección desde la que escriba.
        </p>
      </Seccion>

      <Seccion titulo="Seguridad">
        <p>
          Acceso cerrado por aprobación, ingreso con cuenta de Google sin contrasenas propias,
          cifrado en transito, enlaces compartidos de los que solo se guarda una huella y nunca el
          enlace en claro, y bitácora de auditoria de cada movimiento. Ningun sistema es infalible:
          si detectamos un incidente que afecte sus datos, se lo informaremos.
        </p>
      </Seccion>

      <Seccion titulo="Cambios">
        <p>
          Si esta política cambia, se publica aquí con una versión y una fecha nuevas. Si el cambio
          afecta la finalidad del tratamiento, se pide una autorización nueva.
        </p>
      </Seccion>

      <Seccion titulo="Marco legal">
        <p>
          Ley 1581 de 2012 y Decreto 1377 de 2013 de Colombia. La autoridad de control es la{' '}
          {LEGAL.autoridad}. Si usted ejerce o reside en otro pais, puede aplicarse ademas la norma
          de proteccion de datos de ese pais.
        </p>
      </Seccion>

      <p className="mt-8 text-xs text-grisTexto">
        Este contenido es educativo y no reemplaza una valoración visual individual.
      </p>
    </>
  )
}
