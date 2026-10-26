/**
 * Las fotos de los cuatro tratamientos.
 *
 * Son fotos de archivo con licencia libre de Pexels, que permite el uso
 * comercial sin pedir permiso ni dar credito. El credito va igual: cuesta una
 * linea y es lo correcto.
 *
 * Importante, y hay que decirlo: ninguna de estas fotos muestra un dispositivo
 * de control de miopia en particular. Muestran la situacion, no el producto.
 * Una niña con gafas no prueba que esas gafas sean de control; un frasco no es
 * atropina. Por eso cada foto lleva un pie que dice lo que de verdad se ve, y
 * por eso el carnet sigue siendo independiente de marca. El dia que haya fotos
 * de la consulta, se cambian aqui y listo.
 *
 * La de ortoqueratologia es la mas honesta de todas justamente porque no
 * intenta mostrar el lente: muestra a una niña dormida, que es cuando el
 * tratamiento actua.
 */

import type { TipoTratamiento } from './tratamientos'

export interface FotoTratamiento {
  /** Ruta dentro de /public. */
  src: string
  /** Que se ve de verdad. Es el texto alternativo. */
  alt: string
  /** Autor, para el credito. */
  autor: string
  /** La pagina de la foto, para poder volver a ella. */
  fuente: string
  /**
   * Donde cae el motivo en la foto, para que el recorte no lo pierda cuando
   * el contenedor es mas angosto o mas bajo que la foto.
   */
  encuadre: string
}

export const FOTOS_TRATAMIENTO: Record<TipoTratamiento, FotoTratamiento> = {
  gafas: {
    src: '/fotos/gafas.jpg',
    alt: 'Niña en edad escolar con gafas puestas',
    autor: 'Boris Hamer',
    fuente: 'https://www.pexels.com/photo/29247736/',
    encuadre: '38% 32%',
  },
  lentes_blandos: {
    src: '/fotos/lentes_blandos.jpg',
    alt: 'Lente de contacto blando en la yema del dedo, junto a su estuche',
    autor: 'Nataliya Vaitkevich',
    fuente: 'https://www.pexels.com/photo/5843341/',
    encuadre: '58% 88%',
  },
  ortok: {
    src: '/fotos/ortok.jpg',
    alt: 'Niña dormida: la ortoqueratología actúa durante la noche',
    autor: 'Ron Lach',
    fuente: 'https://www.pexels.com/photo/10608041/',
    encuadre: '60% 50%',
  },
  atropina: {
    src: '/fotos/atropina.jpg',
    alt: 'Frasco gotero de colirio, sin marca',
    autor: 'Nataliya Vaitkevich',
    fuente: 'https://www.pexels.com/photo/5843360/',
    encuadre: '40% 50%',
  },
}

/** La linea de credito que va al pie de donde se usen. */
export const CREDITO_FOTOS =
  'Fotografías de archivo con licencia libre de Pexels: Boris Hamer, Nataliya Vaitkevich y Ron Lach. Ilustran la situación de cada tratamiento, no un dispositivo ni una marca en particular.'
