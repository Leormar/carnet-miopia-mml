/**
 * Arma los videos: cada lamina se dibuja en HTML, se fotografia con Chrome,
 * se narra con Voicebox y se une todo con ffmpeg.
 *
 *   node scripts/video/construir.mjs            todos
 *   node scripts/video/construir.mjs trailer    solo uno
 *
 * Antes hay que tener el servidor de Voicebox escuchando, que es quien tiene
 * las voces Alex y Dora:
 *
 *   cd ~/voicebox && backend/venv/bin/python -m backend.main \
 *     --host 127.0.0.1 --port 17493 \
 *     --data-dir "$HOME/Library/Application Support/sh.voicebox.app"
 *
 * Tambien sirve abrir la aplicacion Voicebox, que levanta el mismo servidor.
 */

import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { VIDEOS, VOCES } from './guiones.mjs'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const VOICEBOX = 'http://127.0.0.1:17493'
const SALIDA = resolve('videos')
const TEMPORAL = resolve('videos/.temporal')

/** Silencio despues de cada narracion, para que la lamina se alcance a leer. */
const RESPIRO = 1.1

function correr(programa, argumentos) {
  return execFileSync(programa, argumentos, { stdio: ['ignore', 'pipe', 'pipe'] })
}

/**
 * Narra un texto con una voz de Voicebox y lo deja en un wav.
 *
 * Reintenta porque el servidor cierra las conexiones en reposo y la primera
 * peticion que reusa una cerrada falla con ECONNRESET. No es un error real:
 * basta volver a pedirlo con una conexion nueva.
 */
async function narrar(texto, voz, destino, intentos = 3) {
  for (let intento = 1; intento <= intentos; intento += 1) {
    try {
      const respuesta = await fetch(`${VOICEBOX}/v1/audio/speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'kokoro',
          voice: voz,
          input: texto,
          response_format: 'wav',
        }),
      })

      if (!respuesta.ok) {
        throw new Error(`Voicebox devolvio ${respuesta.status}: ${await respuesta.text()}`)
      }

      writeFileSync(destino, Buffer.from(await respuesta.arrayBuffer()))
      return
    } catch (error) {
      if (intento === intentos) throw error
      await new Promise((seguir) => setTimeout(seguir, 1500))
    }
  }
}

/** El servidor de Voicebox esta escuchando y conoce las dos voces. */
async function comprobarVoicebox() {
  let perfiles
  try {
    const respuesta = await fetch(`${VOICEBOX}/profiles`)
    perfiles = await respuesta.json()
  } catch {
    console.error(
      'No hay nadie escuchando en ' + VOICEBOX + '.\n' +
        'Abra la aplicacion Voicebox, o levante el servidor:\n' +
        '  cd ~/voicebox && backend/venv/bin/python -m backend.main \\\n' +
        '    --host 127.0.0.1 --port 17493 \\\n' +
        '    --data-dir "$HOME/Library/Application Support/sh.voicebox.app"',
    )
    process.exit(1)
  }

  const nombres = new Set(perfiles.map((p) => p.name))
  const faltan = [...new Set(Object.values(VOCES))].filter((v) => !nombres.has(v))
  if (faltan.length > 0) {
    console.error(
      `Voicebox no tiene la voz ${faltan.join(' ni ')}. Tiene: ${[...nombres].join(', ')}.`,
    )
    process.exit(1)
  }
}

function duracion(archivo) {
  const salida = correr('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    archivo,
  ])
  return Number(String(salida).trim())
}

async function construir(video) {
  const trabajo = resolve(TEMPORAL, video.nombre)
  rmSync(trabajo, { recursive: true, force: true })
  mkdirSync(trabajo, { recursive: true })

  const segmentos = []

  for (const [i, lamina] of video.laminas.entries()) {
    const n = String(i + 1).padStart(2, '0')
    const html = resolve(trabajo, `${n}.html`)
    const png = resolve(trabajo, `${n}.png`)
    const voz = resolve(trabajo, `${n}.wav`)
    const mp4 = resolve(trabajo, `${n}.mp4`)

    writeFileSync(html, lamina.html)

    correr(CHROME, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--virtual-time-budget=4000',
      '--window-size=1920,1080',
      `--screenshot=${png}`,
      `file://${html}`,
    ])

    await narrar(lamina.texto, VOCES[lamina.voz], voz)

    const segundos = duracion(voz) + RESPIRO

    correr('ffmpeg', [
      '-y', '-loglevel', 'error',
      '-loop', '1', '-framerate', '30', '-i', png,
      '-i', voz,
      '-af', `apad=pad_dur=${RESPIRO}`,
      '-t', segundos.toFixed(3),
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
      '-tune', 'stillimage', '-pix_fmt', 'yuv420p', '-r', '30',
      '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2',
      mp4,
    ])

    segmentos.push(mp4)
    process.stdout.write(`   lamina ${n}  ${segundos.toFixed(1)} s  voz ${VOCES[lamina.voz]}\n`)
  }

  const lista = resolve(trabajo, 'lista.txt')
  writeFileSync(lista, segmentos.map((s) => `file '${s}'`).join('\n'))

  const final = resolve(SALIDA, `${video.nombre}.mp4`)
  correr('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'concat', '-safe', '0', '-i', lista,
    '-c', 'copy', '-movflags', '+faststart',
    final,
  ])

  return { final, segundos: duracion(final) }
}

async function principal() {
  if (!existsSync(CHROME)) {
    console.error('No encuentro Google Chrome, que es lo que dibuja las laminas.')
    process.exit(1)
  }

  await comprobarVoicebox()

  mkdirSync(SALIDA, { recursive: true })

  const filtro = process.argv[2]
  const elegidos = filtro ? VIDEOS.filter((v) => v.nombre.includes(filtro)) : VIDEOS

  if (elegidos.length === 0) {
    console.error(`No hay ningun video que se llame "${filtro}".`)
    process.exit(1)
  }

  for (const video of elegidos) {
    console.log(`\n${video.titulo}`)
    const { final, segundos } = await construir(video)
    const minutos = Math.floor(segundos / 60)
    const resto = Math.round(segundos % 60)
    console.log(`   listo: ${final}  (${minutos}:${String(resto).padStart(2, '0')})`)
  }

  rmSync(TEMPORAL, { recursive: true, force: true })
  console.log('\nVideos en la carpeta videos/')
}

principal()
