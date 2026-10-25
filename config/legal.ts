/**
 * Datos que identifican al responsable del tratamiento y la version de los
 * documentos legales. Al cambiar un texto, suba la version y la fecha.
 *
 * Google exige una politica de privacidad y unos terminos publicados en el
 * dominio autorizado antes de dejar publicar la aplicacion en produccion.
 */

export const LEGAL = {
  /** Quien responde ante la autoridad por el tratamiento de los datos. */
  responsable: 'Grupo Manejo Miopia Latam',
  /** Donde escriben las familias para ejercer sus derechos. */
  correoDatos: 'datos@miopialatam.org',
  /** Donde viven los datos. Importante: es una transferencia internacional. */
  alojamiento: {
    proveedores: 'Vercel y Neon',
    region: 'us-east-1, Virginia, Estados Unidos',
  },
  version: 'v1-2026-10',
  fecha: '25 de octubre de 2026',
  autoridad: 'Superintendencia de Industria y Comercio de Colombia',
} as const
