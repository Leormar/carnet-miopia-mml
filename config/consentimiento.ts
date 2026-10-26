/**
 * El documento de consentimiento informado que la familia firma.
 *
 * Es el mismo contenido de la politica de privacidad, dicho en la forma de un
 * documento que se imprime, se envia, se firma y se archiva. Si cambia la
 * politica, cambie aqui tambien y suba la version en `config/legal.ts`: de cada
 * consentimiento guardado queda registrada la version que se firmo.
 *
 * No agregue aqui ninguna afirmacion clinica nueva. Este texto explica el
 * tratamiento de los datos, no el tratamiento del ojo.
 */

export const CONSENTIMIENTO = {
  titulo: 'Autorización para el tratamiento de datos personales de un menor de edad',
  bajada:
    'Carnet de seguimiento del control de miopía del Grupo Manejo Miopía Latam. Ley 1581 de 2012 y Decreto 1377 de 2013.',

  /** Lo que la familia esta autorizando, en una frase. */
  entrada:
    'Yo, en calidad de padre, madre o representante legal del menor identificado abajo, autorizo de manera previa, expresa e informada que sus datos personales y de salud sean tratados en los términos que se explican en este documento.',

  secciones: [
    {
      titulo: 'Quién responde por los datos',
      parrafos: [
        'El responsable del tratamiento es el Grupo Manejo Miopía Latam, que opera la aplicación en seguimiento.miopialatam.org. El profesional que atiende al niño registra los datos dentro de la aplicación y mantiene la relación clínica con la familia.',
      ],
    },
    {
      titulo: 'Qué datos se registran',
      parrafos: [
        'Del niño: nombre, fecha de nacimiento, sexo, documento de identidad si la familia lo aporta, edad de inicio de la miopía, cuántos padres son miopes, agudeza visual, refracción bajo cicloplejía, longitud axial del ojo, equipo con que se midió, tratamiento y dispositivo, registro diario de uso, molestias, hallazgos de cada control y fechas de los próximos controles.',
        'De quien autoriza: nombre, documento, parentesco y datos de contacto cuando el profesional los registra.',
        'Técnicos: fecha, hora, dirección IP y navegador de cada acceso, creación, modificación, consulta, descarga o compartido de la historia. Son la bitácora de auditoría y no se pueden borrar ni editar.',
      ],
    },
    {
      titulo: 'Para qué se usan',
      parrafos: [
        'Para registrar el seguimiento del tratamiento que desacelera la miopía, calcular cuánto creció el ojo, hacer visible cuánto se usa el dispositivo, programar los controles y permitir que el profesional comparta el seguimiento con oftalmología pediátrica cuando la familia lo autoriza.',
        'La aplicación registra y calcula. No diagnostica ni decide tratamientos: la decisión clínica siempre es del profesional.',
        'Los datos no se venden, no se ceden a fabricantes de dispositivos y no se usan con fines comerciales ni publicitarios.',
      ],
    },
    {
      titulo: 'Quién puede verlos',
      parrafos: [
        'El profesional tratante del niño. La familia, que ve el carnet y registra el uso diario. Un profesional invitado, por ejemplo oftalmología pediátrica, cuando se genera un enlace de solo lectura que vence, se puede revocar en cualquier momento y deja registrada cada apertura. Y los administradores de la red, para aprobar solicitudes de acceso y verificar acreditaciones profesionales.',
      ],
    },
    {
      titulo: 'Dónde se guardan',
      parrafos: [
        'En los servidores de Vercel y Neon, en la región us-east-1, Virginia, Estados Unidos. Es decir, los datos se almacenan fuera de Colombia, lo que constituye una transferencia internacional. Esta autorización comprende ese almacenamiento.',
      ],
    },
    {
      titulo: 'Cuánto tiempo se conservan',
      parrafos: [
        'Mientras dure el seguimiento del niño, y después hasta que el representante legal pida su supresión. El profesional tratante puede estar obligado por la norma de su país a conservar la historia clínica por un plazo determinado; en ese caso prevalece esa obligación y el profesional debe informárselo a la familia.',
      ],
    },
  ],

  /** Los derechos, aparte, porque es lo que la familia mas necesita entender. */
  derechos: {
    titulo: 'Sus derechos',
    entrada:
      'Como representante legal del titular, usted puede en cualquier momento y sin dar explicaciones:',
    puntos: [
      'Conocer, actualizar y rectificar los datos del niño.',
      'Pedir una copia completa de todo lo que hay registrado.',
      'Pedir prueba de esta autorización y ser informado del uso que se le ha dado a los datos.',
      'Revocar esta autorización.',
      'Pedir la supresión definitiva de los datos.',
      'Presentar quejas ante la Superintendencia de Industria y Comercio de Colombia.',
    ],
    cierre:
      'Para ejercerlos, pídaselo al profesional tratante o escriba a datos@miopialatam.org indicando el nombre del niño, su parentesco y qué necesita. La respuesta va a la dirección desde la que escriba.',
  },

  /** Lo que se declara al firmar. Va justo encima de la firma. */
  declaracion: [
    'Que esta información me fue explicada en un lenguaje que entiendo y que pude hacer preguntas.',
    'Que entiendo que puedo revocar esta autorización en cualquier momento, sin que eso afecte la atención del niño.',
    'Que la autorización para el tratamiento de los datos es distinta del consentimiento para el procedimiento clínico, que se trata aparte con el profesional.',
  ],

  /** La nota obligatoria en todo el producto. */
  nota: 'Este contenido es educativo y no reemplaza una valoración visual individual.',
} as const
