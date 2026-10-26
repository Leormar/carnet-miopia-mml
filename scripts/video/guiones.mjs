/**
 * Guiones de los videos del carnet MML.
 *
 * Cada lamina lleva su narracion, con una de las dos voces de Voicebox:
 * Alex presenta y explica la parte clinica, Dora habla desde el lado de la
 * familia. Son los perfiles que ya existen en Voicebox, los dos sobre Kokoro
 * en espanol: Alex es em_alex y Dora es ef_dora.
 *
 * Ninguna cifra de aqui es inventada: salen de config/umbrales-clinicos.ts y
 * de config/evidencia.ts, que a su vez vienen del carnet de papel y del post
 * con las referencias verificadas.
 *
 * En la narracion los numeros se escriben en palabras porque el sintetizador
 * lee mejor "cero coma dos" que "0,2".
 */

import {
  COLOR,
  laminaCierre,
  laminaDato,
  laminaFrase,
  laminaPortada,
  laminaPuntos,
  laminaSemaforo,
  laminaTarjetas,
} from './plantilla.mjs'

export const VOCES = {
  alex: 'Alex',
  dora: 'Dora',
}

const TRATAMIENTOS = [
  {
    color: COLOR.azul,
    titulo: 'Gafas para control de miopía',
    texto: 'Controles al mes, a los 6 meses y al año. Uso todo el día, 12 horas o más.',
  },
  {
    color: COLOR.magenta,
    titulo: 'Lentes de contacto blandos',
    texto: 'A la semana, al mes, a los 6 meses y al año. Horas y días de uso, y estado de la córnea.',
  },
  {
    color: COLOR.verde,
    titulo: 'Ortoqueratología',
    texto: 'Al día, a la semana, al mes, a los 3 meses, a los 6 y al año. Topografía y noches de uso.',
  },
  {
    color: COLOR.amarillo,
    titulo: 'Atropina en baja dosis',
    texto: 'Al día, a la semana, al mes, a los 3 meses, a los 6 y al año. Pupila, luz y presión.',
  },
]

const FRANJAS_SEMAFORO = [
  {
    fondo: COLOR.semVerde,
    titulo: 'Verde',
    texto: 'Hasta 0,2 mm al año entre los 7 y los 10 años. Hasta 0,1 entre los 11 y los 16. Como un ojo sin miopía.',
  },
  {
    fondo: COLOR.semAmarillo,
    titulo: 'Amarillo',
    texto: 'Más de lo ideal. Es el momento de revisar la adherencia y los hábitos, antes de cambiar nada.',
  },
  {
    fondo: COLOR.semRojo,
    titulo: 'Rojo',
    texto: 'Desde 0,3 mm al año entre los 7 y los 10, y desde 0,2 entre los 11 y los 16. Como un miope sin tratamiento.',
  },
]

// ---------------------------------------------------------------------------
// Trailer: que es y como funciona
// ---------------------------------------------------------------------------

export const TRAILER = {
  nombre: 'trailer-que-es-y-como-funciona',
  titulo: 'Trailer: qué es y cómo funciona',
  laminas: [
    {
      voz: 'alex',
      texto:
        'Grupo Manejo Miopía Latam presenta Seguimiento MML, el carnet de seguimiento del control de miopía en versión digital.',
      html: laminaPortada({
        titulo: 'Seguimiento MML',
        sub: 'El carnet del control de miopía, de Grupo Manejo Miopía Latam',
      }),
    },
    {
      voz: 'dora',
      texto:
        'Las gafas, los lentes de contacto y las gotas para desacelerar la miopía no actúan en el estuche. Actúan mientras están puestos.',
      html: laminaFrase({
        frase: 'No actuan en el estuche.<br>Actuan mientras están puestos.',
      }),
    },
    {
      voz: 'alex',
      texto: 'Si no se usa, no funciona. Ese es el principio del carnet.',
      html: laminaFrase({
        frase: 'Si no se usa,<br>no funciona.',
        nota: 'El principio del carnet',
      }),
    },
    {
      voz: 'dora',
      texto:
        'Por eso el carnet registra dos cosas juntas: cuánto se usa el tratamiento, y cuánto está creciendo el ojo.',
      html: laminaPuntos({
        titulo: 'Dos cosas, siempre juntas',
        puntos: [
          '<b>El uso real</b>: horas de gafas, horas de lentes blandos, noches de orto-k, gotas de atropina.',
          '<b>El resultado</b>: longitud axial y refracción bajo cicloplejía, control tras control.',
        ],
        colores: [COLOR.azul, COLOR.magenta],
      }),
    },
    {
      voz: 'alex',
      texto:
        'Cuatro tratamientos, un solo carnet. Cada uno con su calendario de controles y con lo que hay que revisar en cada cita.',
      html: laminaTarjetas({
        titulo: 'Cuatro tratamientos, un solo carnet',
        sub: 'Calendario del primer año. Después, control cada 6 meses.',
        tarjetas: TRATAMIENTOS,
        fuente: 'Consejo Mundial de Optometría. Es independiente de marca.',
      }),
    },
    {
      voz: 'dora',
      texto:
        'Un niño puede cambiar de tratamiento, o combinar dos, sin perder su historia. Todo queda en el mismo carnet.',
      html: laminaFrase({
        frase: 'Cambiar o combinar<br>sin perder la historia.',
        nota: 'Orto-k más atropina son dos tratamientos activos, cada uno con su meta y su calendario',
      }),
    },
    {
      voz: 'alex',
      texto:
        'La aplicación calcula cuánto creció el ojo en los últimos doce meses y lo muestra con el mismo semáforo del carnet.',
      html: laminaSemaforo({
        titulo: 'El crecimiento en 12 meses, con semáforo',
        franjas: FRANJAS_SEMAFORO,
        fuente: 'Myopia Profile y carnet del Grupo Manejo Miopía Latam. Meta de largo plazo: menos de 26 mm (Tideman 2016).',
      }),
    },
    {
      voz: 'dora',
      texto:
        'La familia registra el uso desde el teléfono, en un toque: anoche durmió con los lentes, hoy usó las gafas tantas horas, hoy se puso la gota.',
      html: laminaPuntos({
        titulo: 'La familia registra desde el teléfono',
        sub: 'Un botón grande por tratamiento activo, pensado primero para el celular.',
        puntos: [
          'Orto-k: anoche durmió con los lentes, sí o no.',
          'Gafas y lentes blandos: cuántas horas se usó hoy.',
          'Atropina: la gota de esta noche, sí o no.',
          'Y la semana a la vista, día por día.',
        ],
      }),
    },
    {
      voz: 'alex',
      texto:
        'Y usted comparte el seguimiento con oftalmología pediátrica por un enlace o un código QR que vence y que puede revocar cuando quiera.',
      html: laminaPuntos({
        titulo: 'Compartir sin perder el control',
        puntos: [
          'Un enlace de solo lectura, con código QR para imprimir y llevar a la cita.',
          'Vence solo, entre 7 y 180 días, y se revoca de inmediato.',
          'Quien lo recibe ve, y no puede modificar nada.',
          'Cada apertura queda en la bitacora de auditoría.',
        ],
        colores: [COLOR.verde, COLOR.azul, COLOR.magenta, COLOR.amarillo],
      }),
    },
    {
      voz: 'dora',
      texto: 'El carnet del grupo: en papel para llevarlo a la cita, y aquí para calcular lo que el papel no calcula.',
      html: laminaCierre({
        titulo: 'seguimiento.miopialatam.org',
        sub: 'Acceso para profesionales de la red, por aprobación.',
      }),
    },
  ],
}

// ---------------------------------------------------------------------------
// Video 1: manejo, los primeros pasos
// ---------------------------------------------------------------------------

export const MANEJO = {
  nombre: 'manejo-primeros-pasos',
  titulo: 'Manejo: los primeros pasos',
  laminas: [
    {
      voz: 'alex',
      texto:
        'Manejo del carnet: los primeros pasos. Desde que pide el acceso hasta que entrega el primer carnet a una familia.',
      html: laminaPortada({
        titulo: 'Manejo:<br>los primeros pasos',
        sub: 'Del acceso al primer carnet entregado',
      }),
    },
    {
      voz: 'alex',
      texto:
        'El acceso es cerrado. Usted entra con su cuenta de Google y un administrador de la red aprueba la solicitud.',
      html: laminaPuntos({
        titulo: 'Primero: pedir acceso',
        puntos: [
          'Entre a seguimiento.miopialatam.org y pulse Ingresar con Google.',
          'Cuente quién es y dónde ejerce en la nota de la solicitud.',
          'Un administrador de la red lo aprueba. Nadie entra solo.',
        ],
      }),
    },
    {
      voz: 'dora',
      texto:
        'Ya aprobado, antes de abrir la primera historia hay dos pasos que se hacen una sola vez.',
      html: laminaPuntos({
        titulo: 'Dos pasos, una sola vez',
        sub: 'Solo para quien ejerce. Un familiar invitado a un paciente no pasa por aquí.',
        puntos: [
          '<b>Paso 1.</b> Firmar el compromiso de manejo de información.',
          '<b>Paso 2.</b> Subir el documento que lo acredita como profesional en su país.',
        ],
        colores: [COLOR.azul, COLOR.verde],
      }),
    },
    {
      voz: 'alex',
      texto:
        'El compromiso explica qué datos hay aquí, para qué se usan, a qué se compromete usted, y qué queda registrado de usted. Léalo: no es un trámite.',
      html: laminaPuntos({
        titulo: 'El compromiso de manejo de información',
        puntos: [
          'Pedir el consentimiento del representante legal antes de crear la historia de un niño.',
          'Entrar solo a las historias de los pacientes que usted atiende.',
          'No compartir su usuario, y compartir datos solo por el enlace que vence.',
          'Avisar de inmediato si sospecha un acceso no autorizado.',
        ],
      }),
    },
    {
      voz: 'dora',
      texto:
        'Después sube el documento que acredita su ejercicio en su país: la tarjeta profesional, la colegiatura, el registro sanitario o el título. Puede entrar apenas lo suba, sin esperar.',
      html: laminaPuntos({
        titulo: 'Su acreditación profesional',
        sub: 'El nombre del documento cambia en cada país. Usted elige el país y escribe cómo se llama allá.',
        puntos: [
          'Se aceptan PDF, JPG y PNG, hasta 4 MB.',
          'Lo revisa un administrador y lo marca como verificado.',
          'No se publica ni se comparte con nadie más.',
          'Si su habilitación cambia o se vence, se actualiza aquí.',
        ],
        colores: [COLOR.amarillo, COLOR.verde, COLOR.azul, COLOR.magenta],
      }),
    },
    {
      voz: 'alex',
      texto:
        'Ahora sí, el primer paciente. Datos de base: nombre, fecha de nacimiento, edad de inicio de la miopía y cuántos padres son miopes.',
      html: laminaPuntos({
        titulo: 'Crear el paciente',
        puntos: [
          'Nombre, fecha de nacimiento y sexo.',
          'Edad a la que se detectó la miopía.',
          'Cuántos padres son miopes: ninguno, uno o dos.',
          'Oftalmólogo, institución y contacto de la familia.',
        ],
      }),
    },
    {
      voz: 'dora',
      texto:
        'Y el consentimiento del padre, la madre o el representante legal. Sin eso no se crea la historia: la aplicación no lo deja seguir.',
      html: laminaFrase({
        frase: 'Sin consentimiento<br>no hay historia.',
        nota: 'Quién autoriza, con qué documento y en que fecha. Ley 1581 de 2012 y Decreto 1377 de 2013',
      }),
    },
    {
      voz: 'alex',
      texto:
        'Si el niño ya está registrado, la aplicación lo avisa. Dos historias del mismo niño parten el seguimiento en dos y se pierde el crecimiento del año.',
      html: laminaPuntos({
        titulo: 'Un niño, una sola historia',
        puntos: [
          'El documento de identidad no se puede repetir dentro de la red.',
          'Si coinciden el nombre y la fecha de nacimiento, la aplicación avisa antes de crear.',
          'Si de verdad son dos niños distintos, se diferencian con el documento.',
        ],
        colores: [COLOR.magenta, COLOR.amarillo, COLOR.verde],
      }),
    },
    {
      voz: 'alex',
      texto:
        'Después abre el tratamiento. Elige el tipo, el dispositivo o la concentración, la fecha de inicio y la meta de uso. El calendario de controles se genera solo.',
      html: laminaTarjetas({
        titulo: 'Abrir el tratamiento',
        sub: 'Al abrirlo, la aplicación programa los controles del primer año.',
        tarjetas: TRATAMIENTOS,
        fuente:
          'Las metas por defecto se pueden editar: gafas 12 horas al día; blandos 10 horas, 6 días por semana; orto-k todas las noches; atropina todas las noches.',
      }),
    },
    {
      voz: 'dora',
      texto:
        'En ortoqueratología, además del calendario del Consejo Mundial de Optometría, está disponible el protocolo de la consulta de PROLENS.',
      html: laminaPuntos({
        titulo: 'Calendarios a elegir',
        sub: 'En orto-k, el protocolo de PROLENS viene como opción.',
        puntos: [
          'La mañana siguiente a la primera noche, con los lentes puestos.',
          'A los 15 días, al mes y a los 3 meses, con topografía.',
          'Después cada 6 meses, con biometría y topografía.',
          'Reemplazo del lente cada año.',
        ],
        colores: [COLOR.verde, COLOR.verde, COLOR.verde, COLOR.verde],
      }),
    },
    {
      voz: 'alex',
      texto:
        'El primer control es la línea de base. Agudeza visual, refracción bajo cicloplejía y longitud axial de los dos ojos, siempre anotando con qué equipo se midió.',
      html: laminaPuntos({
        titulo: 'El primer control',
        sub: 'Formulario pensado para llenarse en consulta en menos de dos minutos.',
        puntos: [
          'Agudeza visual de ojo derecho y ojo izquierdo.',
          'Refracción bajo cicloplejía. El equivalente esférico lo calcula la aplicación.',
          'Longitud axial con dos decimales, y el equipo de biometría. El equipo es obligatorio.',
          'Hallazgos propios del tratamiento, molestias, decisión y próximo control.',
        ],
      }),
    },
    {
      voz: 'dora',
      texto:
        'Y por último, entregue el carnet. Se imprime en dos páginas y la familia lo lleva a todas las citas, con usted y con el oftalmólogo.',
      html: laminaCierre({
        titulo: 'Listo para la primera cita',
        sub: 'Imprima el carnet, o guardelo en PDF, y entreguelo a la familia.',
      }),
    },
  ],
}

// ---------------------------------------------------------------------------
// Video 2: seguimiento
// ---------------------------------------------------------------------------

export const SEGUIMIENTO = {
  nombre: 'seguimiento-control-tras-control',
  titulo: 'Seguimiento: control tras control',
  laminas: [
    {
      voz: 'alex',
      texto:
        'Seguimiento: control tras control. Cómo leer lo que la aplicación calcula, y qué hacer con eso en la consulta.',
      html: laminaPortada({
        titulo: 'Seguimiento:<br>control tras control',
        sub: 'Leer el crecimiento, leer el uso, y conversarlo con la familia',
      }),
    },
    {
      voz: 'dora',
      texto:
        'El panel muestra a todos sus pacientes de un vistazo: el semáforo, la adherencia del último mes, el próximo control y los que ya están vencidos.',
      html: laminaPuntos({
        titulo: 'El panel',
        puntos: [
          'Semaforo del crecimiento de los últimos 12 meses, por paciente.',
          'Adherencia de los últimos 30 días.',
          'Próximo control, y cuántos están vencidos.',
          'Los tratamientos activos, con su color.',
        ],
      }),
    },
    {
      voz: 'alex',
      texto:
        'El crecimiento se calcula anualizado entre dos controles, y en la ventana de los últimos doce meses, para cada ojo por separado.',
      html: laminaSemaforo({
        titulo: 'Cómo se lee el crecimiento',
        sub: 'Se compara el último control contra el que esté más cerca de hacer un año, con 60 días de margen.',
        franjas: FRANJAS_SEMAFORO,
        fuente: 'Myopia Profile y carnet del Grupo Manejo Miopía Latam.',
      }),
    },
    {
      voz: 'dora',
      texto:
        'Por debajo de los siete años o por encima de los dieciséis, la aplicación muestra el dato pero no pone semáforo, porque no hay un umbral publicado para esas edades.',
      html: laminaFrase({
        frase: 'Si no hay umbral publicado,<br>no hay semáforo.',
        nota: 'La aplicación muestra el dato con una nota, y no se inventa una franja',
      }),
    },
    {
      voz: 'alex',
      texto:
        'La meta de largo plazo es mantener el ojo por debajo de veintiséis milímetros. La aplicación avisa al acercarse.',
      html: laminaDato({
        dato: '26 mm',
        texto: 'La meta de largo plazo. El aviso aparece desde los 25,5 milímetros.',
        fuente: 'Tideman 2016, JAMA Ophthalmology.',
      }),
    },
    {
      voz: 'dora',
      texto:
        'Si los dos controles que se comparan se midieron con equipos distintos, aparece una advertencia: esa diferencia puede no ser solo crecimiento del ojo.',
      html: laminaPuntos({
        titulo: 'Compare siempre con el mismo equipo',
        puntos: [
          'El equipo de biometría se anota en cada control.',
          'Si cambia entre los dos controles comparados, la aplicación lo advierte.',
          'Los equipos se registran una vez, en Ajustes.',
        ],
        colores: [COLOR.amarillo, COLOR.magenta, COLOR.azul],
      }),
    },
    {
      voz: 'alex',
      texto:
        'Al lado del crecimiento, siempre la adherencia: a siete, a treinta y a noventa días, y cuántos días no se registró nada.',
      html: laminaPuntos({
        titulo: 'La adherencia, al lado del crecimiento',
        puntos: [
          'Porcentaje de días o noches cumplidos a 7, 30 y 90 días.',
          'Promedio de horas, en gafas y en lentes blandos.',
          'Los días sin registro se cuentan aparte, y se muestran.',
          'Los días con molestias, también.',
        ],
      }),
    },
    {
      voz: 'dora',
      texto:
        'Y aquí está la razón de todo esto: cuando se han medido las horas de uso, el efecto del tratamiento sube con ellas.',
      html: laminaDato({
        dato: '0,99 D',
        texto:
          'Gafas con microlentes altamente asféricas: la diferencia frente a gafas convencionales en los niños que las usaron 12 horas o más al día, frente a 0,80 D en el promedio del estudio.',
        fuente: 'Bao y colaboradores, 2022, JAMA Ophthalmology.',
      }),
    },
    {
      voz: 'alex',
      texto:
        'Lo mismo con los lentes de contacto blandos de desenfoque, y con los segmentos de desenfoque.',
      html: laminaPuntos({
        titulo: 'Más horas, más efecto',
        puntos: [
          '<b>46 %</b> menos de progresión en los niños que usaron los lentes blandos de desenfoque 5 horas o más al día, frente a cerca de 25 % en el promedio. Lam 2014.',
          '<b>62 %</b> menos de crecimiento del ojo con gafas de segmentos de desenfoque, usadas en promedio unas 15 horas diarias. Lam 2020.',
          '<b>Entre 6 % y 21 %</b> de los niños abandona cada año el tratamiento óptico, según la modalidad. Santodomingo-Rubido 2026.',
        ],
        colores: [COLOR.magenta, COLOR.azul, COLOR.amarillo],
      }),
    },
    {
      voz: 'dora',
      texto:
        'Por eso, cuando el ojo creció más de lo esperado y la adherencia fue baja, la aplicación sugiere revisar el uso antes de cambiar de tratamiento. Sugiere: la decisión es suya.',
      html: laminaFrase({
        frase: 'Antes de cambiar el tratamiento,<br>revise si se está usando.',
        nota: 'La aplicación registra y calcula. No diagnostica ni decide tratamientos',
      }),
    },
    {
      voz: 'alex',
      texto:
        'Para la cita con oftalmología pediátrica, genere un enlace de solo lectura con su código QR. Lo puede generar usted o la familia.',
      html: laminaPuntos({
        titulo: 'Compartir con oftalmopediatría',
        puntos: [
          'Elija para quien es y en cuánto vence, entre 7 y 180 días.',
          'Imprima la hoja con el QR y entreguesela a la familia.',
          'Quien lo recibe ve el seguimiento completo, sin cuenta, y no puede editar.',
          'Revóquelo cuando quiera. Cada apertura queda registrada.',
        ],
        colores: [COLOR.verde, COLOR.azul, COLOR.magenta, COLOR.amarillo],
      }),
    },
    {
      voz: 'dora',
      texto:
        'Y en cualquier momento, la familia puede pedir una copia de todos los datos de su hijo, corregirlos, retirar la autorización o pedir que se borren. Están los cuatro botones.',
      html: laminaPuntos({
        titulo: 'Los derechos de la familia',
        sub: 'En la página de datos y consentimiento de cada paciente.',
        puntos: [
          'Descargar una copia completa de todo lo registrado.',
          'Retirar la autorización del representante legal.',
          'Archivar al paciente cuando termina el seguimiento.',
          'Suprimir definitivamente, con confirmacion de un administrador.',
        ],
      }),
    },
    {
      voz: 'alex',
      texto:
        'Todo queda en la bitácora: quién creó, quién modificó, quién consultó y quién compartió cada historia. No se puede editar ni borrar.',
      html: laminaCierre({
        titulo: 'Lo que se anota, se conversa',
        sub: 'Control tras control, con la familia delante.',
      }),
    },
  ],
}

export const VIDEOS = [TRAILER, MANEJO, SEGUIMIENTO]
