/**
 * Compromiso de manejo de informacion que firma cada miembro de la red antes
 * de entrar por primera vez.
 *
 * Al cambiar el texto hay que subir la version: la aplicacion vuelve a pedir
 * la firma a todo el mundo, y queda constancia de quien acepto cual version.
 *
 * Este texto fue redactado para el Grupo Manejo Miopia Latam y debe ser
 * revisado por el asesor juridico de la red antes de considerarlo definitivo.
 */

export const VERSION_COMPROMISO = 'v1-2026-10'

export interface PuntoDelCompromiso {
  titulo: string
  parrafos: string[]
}

export const COMPROMISO: PuntoDelCompromiso[] = [
  {
    titulo: 'Que datos hay aquí',
    parrafos: [
      'Esta aplicación guarda datos de salud de niños: nombre, fecha de nacimiento, refracción, longitud axial del ojo, tratamiento y uso diario del dispositivo. Son datos sensibles y de menores de edad, la categoria que mas protección exige.',
      'También guarda datos suyos: su nombre, su correo, el país donde ejerce y el documento con el que acredito su ejercicio profesional.',
    ],
  },
  {
    titulo: 'Para que se usan',
    parrafos: [
      'Para registrar el seguimiento del tratamiento, calcular cuánto creció el ojo y hacer visible el uso real del dispositivo. La aplicación registra y calcula; no diagnostica ni decide tratamientos. La decisión clínica siempre es suya.',
      'Los datos no se venden, no se ceden a fabricantes y no se usan con fines comerciales.',
    ],
  },
  {
    titulo: 'A que se compromete usted',
    parrafos: [
      'A pedir el consentimiento informado del padre, la madre o el representante legal antes de crear la historia de un niño, y a dejar constancia de quien lo autorizo.',
      'A entrar solo a las historias de los pacientes que atiende. Abrir la historia de un niño que no es suyo es una falta, aunque la aplicación se lo permita técnicamente.',
      'A no compartir su usuario ni su contraseña, y a no dejar la sesión abierta en un equipo compartido.',
      'A compartir información con otro profesional solo por el enlace de solo lectura de la aplicación, que vence y se puede revocar, y no por correo, chat o captura de pantalla.',
      'A avisar de inmediato a los administradores de la red si sospecha que alguien accedió a datos sin autorización, o si pierde el equipo desde el que entra.',
    ],
  },
  {
    titulo: 'Transparencia: lo que queda registrado de usted',
    parrafos: [
      'Cada vez que crea, modifica, consulta, exporta o comparte la historia de un paciente, la aplicación guarda quien fue, que hizo, cuando, desde que dirección IP y con que navegador. Esa bitácora no se puede borrar ni editar, tampoco por un administrador.',
      'Se registra así porque la ley lo exige para datos de salud, y porque una historia compartida entre varios profesionales solo es confiable si se sabe quien tocó que. Usted puede pedir en cualquier momento una copia de lo que la bitácora dice de usted.',
    ],
  },
  {
    titulo: 'Los derechos de la familia',
    parrafos: [
      'El padre, la madre o el representante legal puede pedir en cualquier momento una copia de todos los datos de su hijo, corregir lo que este mal, revocar el consentimiento y pedir que se supriman los datos. La aplicación tiene un boton para cada una de esas cuatro cosas.',
      'Si una familia le pide algo de eso, usted debe atenderlo, no remitirlo a otra parte. Es su obligación como responsable del tratamiento de esos datos.',
    ],
  },
  {
    titulo: 'Su acreditación profesional',
    parrafos: [
      'Para entrar debe subir el documento que lo acredita como profesional habilitado en su país. Ese documento lo revisa un administrador de la red y solo se usa para verificar que usted puede ejercer. No se publica ni se comparte con nadie mas.',
      'Si su habilitación se vence, se suspende o cambia de país, debe actualizarla aquí.',
    ],
  },
  {
    titulo: 'Marco legal',
    parrafos: [
      'El tratamiento de estos datos se rige por la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia, donde está alojada la aplicación. Si usted ejerce en otro país, debe cumplir además la norma de protección de datos de su propio país.',
    ],
  },
]

/** Lo que la persona marca para firmar. */
export const CASILLAS_COMPROMISO = [
  'Lei y acepto el compromiso de manejo de información.',
  'Entiendo que cada consulta que haga a una historia queda registrada en la bitácora.',
  'Me comprometo a pedir el consentimiento del representante legal antes de crear la historia de un niño.',
] as const
