/**
 * Evidencia citada en la portada.
 *
 * Tomada del post del Grupo Manejo Miopia Latam "Si no se usa, no funciona",
 * en referencia/post-adherencia-carnet.md, con sus referencias verificadas.
 * No agregar aqui ninguna cifra que no este en esa fuente.
 */

export interface DatoDeEvidencia {
  cifra: string
  unidad: string
  texto: string
  fuente: string
}

export const EVIDENCIA: DatoDeEvidencia[] = [
  {
    cifra: '0,99',
    unidad: 'D',
    texto:
      'Con gafas de microlentes altamente asfericas, la diferencia frente a gafas convencionales a dos anos fue de 0,80 D en general, y de 0,99 D en los ninos que las usaron 12 horas o mas al dia.',
    fuente: 'Bao J, et al. JAMA Ophthalmol. 2022;140(5):472-478',
  },
  {
    cifra: '46',
    unidad: '%',
    texto:
      'Con lentes de contacto blandos de desenfoque, el efecto promedio fue cerca de 25 % menos progresion. Los ninos que los usaron 5 horas o mas al dia progresaron 46 % menos que el grupo control.',
    fuente: 'Lam CSY, et al. Br J Ophthalmol. 2014;98(1):40-45',
  },
  {
    cifra: '62',
    unidad: '%',
    texto:
      'Con gafas de segmentos de desenfoque, usadas en promedio unas 15 horas diarias, la progresion fue 52 % menor y el crecimiento del ojo 62 % menor que con gafas convencionales.',
    fuente: 'Lam CSY, et al. Br J Ophthalmol. 2020;104(3):363-368',
  },
  {
    cifra: '6 a 21',
    unidad: '%',
    texto:
      'Una revision sistematica de 57 ensayos encontro que entre el 6 % y el 21 % de los ninos abandona cada ano el tratamiento optico, segun la modalidad. Y eso ocurre dentro de estudios clinicos.',
    fuente: 'Santodomingo-Rubido J, et al. Cont Lens Anterior Eye. 2026;49(2):102601',
  },
]

export const REFERENCIAS_PORTADA = [
  'Gifford KL, et al. IMI Clinical management guidelines report. Invest Ophthalmol Vis Sci. 2019;60(3):M184-M203',
  'World Council of Optometry. Myopia measurement and patient follow-up',
  'Tideman JWL, et al. JAMA Ophthalmol. 2016;134(12):1355-1363',
  'Myopia Profile (Gifford)',
]
