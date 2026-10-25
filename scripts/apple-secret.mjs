#!/usr/bin/env node
/**
 * Genera el "client secret" de Ingresar con Apple.
 *
 * Apple no entrega un secreto fijo: hay que firmar un JWT con la llave .p8 que
 * descargo del portal de desarrollador. Ese JWT vence, como maximo, a los 6
 * meses, asi que este script hay que volverlo a correr antes de que venza y
 * actualizar AUTH_APPLE_SECRET.
 *
 * Uso:
 *   node scripts/apple-secret.mjs \
 *     --team-id ABCDE12345 \
 *     --key-id XYZ9876543 \
 *     --services-id org.miopialatam.seguimiento \
 *     --p8 ~/Downloads/AuthKey_XYZ9876543.p8
 */

import { createSign, createPrivateKey } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function argumento(nombre) {
  const i = process.argv.indexOf(`--${nombre}`)
  return i !== -1 ? process.argv[i + 1] : undefined
}

const teamId = argumento('team-id')
const keyId = argumento('key-id')
const servicesId = argumento('services-id')
const rutaP8 = argumento('p8')
/** Apple permite hasta 6 meses (15777000 s). Por defecto usamos el maximo. */
const dias = Number(argumento('dias') ?? 180)

if (!teamId || !keyId || !servicesId || !rutaP8) {
  console.error(`
Faltan datos. Uso:

  node scripts/apple-secret.mjs \\
    --team-id ABCDE12345 \\
    --key-id XYZ9876543 \\
    --services-id org.miopialatam.seguimiento \\
    --p8 ~/Downloads/AuthKey_XYZ9876543.p8

  --team-id       Team ID, arriba a la derecha en developer.apple.com/account
  --key-id        Key ID de la llave de "Sign in with Apple"
  --services-id   El Services ID (es el AUTH_APPLE_ID)
  --p8            Ruta al archivo AuthKey_XXXXXXXXXX.p8
  --dias          Vigencia en dias, maximo 180. Por defecto 180
`)
  process.exit(1)
}

if (dias > 180) {
  console.error('Apple no acepta mas de 180 dias de vigencia.')
  process.exit(1)
}

const base64url = (entrada) =>
  Buffer.from(entrada).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const ahora = Math.floor(Date.now() / 1000)
const vence = ahora + dias * 86400

const encabezado = { alg: 'ES256', kid: keyId }
const carga = {
  iss: teamId,
  iat: ahora,
  exp: vence,
  aud: 'https://appleid.apple.com',
  sub: servicesId,
}

const cuerpo = `${base64url(JSON.stringify(encabezado))}.${base64url(JSON.stringify(carga))}`

let llave
try {
  llave = createPrivateKey(readFileSync(resolve(rutaP8.replace(/^~/, process.env.HOME ?? '~'))))
} catch (error) {
  console.error(`No se pudo leer la llave en ${rutaP8}`)
  console.error(error.message)
  process.exit(1)
}

const firmador = createSign('SHA256')
firmador.update(cuerpo)
firmador.end()
// JWS ES256 exige la firma cruda r||s, no el DER que usa OpenSSL por defecto.
const firma = firmador.sign({ key: llave, dsaEncoding: 'ieee-p1363' })

const jwt = `${cuerpo}.${firma.toString('base64url')}`

console.log('\nAUTH_APPLE_ID=' + servicesId)
console.log('AUTH_APPLE_SECRET=' + jwt)
console.log(
  `\nVence el ${new Date(vence * 1000).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}.` +
    ' Vuelva a correr este script antes de esa fecha y actualice la variable en Vercel.\n',
)
