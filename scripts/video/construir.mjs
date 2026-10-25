/**
 * Arma los videos: cada lamina se dibuja en HTML, se fotografia con Chrome,
 * se narra con la voz del sistema y se une todo con ffmpeg.
 *
 *   node scripts/video/construir.mjs            todos
 *   node scripts/video/construir.mjs trailer    solo uno
 */

import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { VIDEOS, VOCES } from './guiones.mjs'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const SALIDA = resolve('videos')
const TEMPORAL = resolve('videos/.temporal')

/** Palabras por minuto. Mas lento que lo normal: es material clinico. */
const VELOCIDAD = 165
/** Silencio despues de cada narracion, para que la lamina se alcance a leer. */
const RESPIRO = 1.1

function correr(programa, argumentos) {
  return execFileSync(programa, argumentos, { stdio: ['ignore', 'pipe', 'pipe'] })
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

function construir(video) {
  const trabajo = resolve(TEMPORAL, video.nombre)
  rmSync(trabajo, { recursive: true, force: true })
  mkdirSync(trabajo, { recursive: true })

  const segmentos = []

  video.laminas.forEach((lamina, i) => {
    const n = String(i + 1).padStart(2, '0')
    const html = resolve(trabajo, `${n}.html`)
    const png = resolve(trabajo, `${n}.png`)
    const aiff = resolve(trabajo, `${n}.aiff`)
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

    correr('say', ['-v', VOCES[lamina.voz], '-r', String(VELOCIDAD), '-o', aiff, lamina.texto])

    const segundos = duracion(aiff) + RESPIRO

    correr('ffmpeg', [
      '-y', '-loglevel', 'error',
      '-loop', '1', '-framerate', '30', '-i', png,
      '-i', aiff,
      '-af', `apad=pad_dur=${RESPIRO}`,
      '-t', segundos.toFixed(3),
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
      '-tune', 'stillimage', '-pix_fmt', 'yuv420p', '-r', '30',
      '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2',
      mp4,
    ])

    segmentos.push(mp4)
    process.stdout.write(`   lamina ${n}  ${segundos.toFixed(1)} s  voz ${VOCES[lamina.voz]}\n`)
  })

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

function principal() {
  if (!existsSync(CHROME)) {
    console.error('No encuentro Google Chrome, que es lo que dibuja las laminas.')
    process.exit(1)
  }

  mkdirSync(SALIDA, { recursive: true })

  const filtro = process.argv[2]
  const elegidos = filtro ? VIDEOS.filter((v) => v.nombre.includes(filtro)) : VIDEOS

  if (elegidos.length === 0) {
    console.error(`No hay ningun video que se llame "${filtro}".`)
    process.exit(1)
  }

  for (const video of elegidos) {
    console.log(`\n${video.titulo}`)
    const { final, segundos } = construir(video)
    const minutos = Math.floor(segundos / 60)
    const resto = Math.round(segundos % 60)
    console.log(`   listo: ${final}  (${minutos}:${String(resto).padStart(2, '0')})`)
  }

  rmSync(TEMPORAL, { recursive: true, force: true })
  console.log('\nVideos en la carpeta videos/')
}

principal()
