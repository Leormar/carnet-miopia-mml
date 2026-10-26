/**
 * Arma el video del recorrido por la aplicacion.
 *
 * A diferencia de los otros tres, que son laminas dibujadas, este usa
 * grabaciones de la aplicacion de verdad, hechas aparte con el navegador. Aqui
 * solo se normalizan, se narran y se pegan, con una portada y un cierre
 * dibujados con la misma plantilla de siempre para que no desentone.
 *
 *   node scripts/video/recorrido.mjs <carpeta-con-los-clips>
 *
 * La carpeta debe tener clip-panel.webm, clip-resumen.webm, clip-pestanas.webm,
 * clip-graficas.webm, clip-tratamientos.webm y clip-consentimiento.webm.
 *
 * Hace falta el servidor de Voicebox escuchando, igual que para los otros:
 *
 *   cd ~/voicebox && backend/venv/bin/python -m backend.main \
 *     --host 127.0.0.1 --port 17493 \
 *     --data-dir "$HOME/Library/Application Support/sh.voicebox.app"
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { VOCES } from './guiones.mjs'
import { laminaPortada, laminaCierre } from './plantilla.mjs'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const VOICEBOX = 'http://127.0.0.1:17493'
const SALIDA = resolve('videos')
const TEMPORAL = resolve('videos/.temporal/recorrido')

/** Silencio al final de cada tramo, para que la pantalla se alcance a leer. */
const RESPIRO = 1.0
/** Fondo crema de MML: es lo que rellena los costados del video. */
const CREMA = '#faf8f3'

function correr(programa, argumentos) {
  return execFileSync(programa, argumentos, { stdio: ['ignore', 'pipe', 'pipe'] })
}

function duracion(archivo) {
  const salida = correr('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-count_frames',
    '-show_entries', 'stream=nb_read_frames,r_frame_rate',
    '-show_entries', 'format=duration',
    '-of', 'default=nw=1:nk=1',
    archivo,
  ]).toString().trim().split('\n')
  const duracionDeclarada = Number(salida[salida.length - 1])
  if (Number.isFinite(duracionDeclarada) && duracionDeclarada > 0) return duracionDeclarada
  // Las grabaciones del navegador vienen sin duracion: se cuenta por cuadros.
  const [num, den] = salida[0].split('/').map(Number)
  return Number(salida[1]) / (num / (den || 1))
}

/** Igual que en construir.mjs: el servidor cierra conexiones en reposo. */
async function narrar(texto, voz, destino, intentos = 3) {
  for (let intento = 1; intento <= intentos; intento += 1) {
    try {
      const respuesta = await fetch(`${VOICEBOX}/v1/audio/speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Connection: 'close' },
        body: JSON.stringify({ model: 'kokoro', voice: voz, input: texto, response_format: 'wav' }),
      })
      if (!respuesta.ok) {
        throw new Error(`Voicebox devolvio ${respuesta.status}: ${await respuesta.text()}`)
      }
      writeFileSync(destino, Buffer.from(await respuesta.arrayBuffer()))
      return
    } catch (error) {
      if (intento === intentos) throw error
      await new Promise((r) => setTimeout(r, 400 * intento))
    }
  }
}

function duracionAudio(archivo) {
  return Number(
    correr('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', archivo])
      .toString()
      .trim(),
  )
}

/** Dibuja una lamina y la deja en png, como hace construir.mjs. */
function fotografiarLamina(html, destino, trabajo, nombre) {
  const ruta = resolve(trabajo, `${nombre}.html`)
  writeFileSync(ruta, html)
  correr(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--virtual-time-budget=4000',
    '--window-size=1920,1080',
    `--screenshot=${destino}`,
    `file://${ruta}`,
  ])
}

/** Una lamina quieta con su narracion, igual que en los otros videos. */
async function tramoDeLamina(html, texto, voz, trabajo, nombre) {
  const png = resolve(trabajo, `${nombre}.png`)
  const wav = resolve(trabajo, `${nombre}.wav`)
  const mp4 = resolve(trabajo, `${nombre}.mp4`)
  fotografiarLamina(html, png, trabajo, nombre)
  await narrar(texto, VOCES[voz], wav)
  const segundos = duracionAudio(wav) + RESPIRO
  correr('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-loop', '1', '-framerate', '30', '-i', png,
    '-i', wav,
    '-af', `apad=pad_dur=${RESPIRO}`,
    '-t', segundos.toFixed(3),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
    '-tune', 'stillimage', '-pix_fmt', 'yuv420p', '-r', '30',
    '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2',
    mp4,
  ])
  return { mp4, segundos }
}

/**
 * Una grabacion de pantalla con su narracion.
 *
 * La grabacion viene en 16:10 y el video es 16:9: se ajusta a lo alto y se
 * rellenan los costados con el crema de la marca, que es mejor que recortar
 * contenido. Si la narracion dura mas que la grabacion, se congela el ultimo
 * cuadro hasta que termine de hablar; nunca al reves, que acelerar una
 * pantalla se nota.
 */
async function tramoDeGrabacion(clip, texto, voz, trabajo, nombre) {
  const wav = resolve(trabajo, `${nombre}.wav`)
  const mp4 = resolve(trabajo, `${nombre}.mp4`)
  await narrar(texto, VOCES[voz], wav)

  const hablado = duracionAudio(wav)
  const grabado = duracion(clip)
  const total = Math.max(grabado, hablado + RESPIRO)
  const congelar = Math.max(0, total - grabado)

  correr('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-fflags', '+genpts', '-i', clip,
    '-i', wav,
    '-filter_complex',
    `[0:v]fps=30,scale=-2:1080:flags=lanczos,pad=1920:1080:(ow-iw)/2:0:color=${CREMA},` +
      `tpad=stop_mode=clone:stop_duration=${congelar.toFixed(3)},setsar=1[v];` +
      `[1:a]apad=pad_dur=${(total - hablado).toFixed(3)}[a]`,
    '-map', '[v]', '-map', '[a]',
    '-t', total.toFixed(3),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-r', '30',
    '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2',
    mp4,
  ])
  return { mp4, segundos: total }
}

// ---------------------------------------------------------------------------
// El guion. Los numeros que se nombran son los del paciente de demostracion,
// que es inventado, y el video lo dice en voz alta antes de dar ninguno.
// ---------------------------------------------------------------------------

const GUION = [
  {
    tipo: 'lamina',
    voz: 'alex',
    texto:
      'Seguimiento MML por dentro. Un recorrido por la aplicación con un paciente de demostración.',
    html: laminaPortada({
      titulo: 'Seguimiento MML<br>por dentro',
      sub: 'Un recorrido con un paciente de demostración',
    }),
  },
  {
    tipo: 'grabacion',
    clip: 'clip-panel.webm',
    voz: 'dora',
    texto:
      'Este es el panel. Cada niño con su semáforo de crecimiento de los últimos doce meses, su adherencia de los últimos treinta días y la fecha del próximo control. Luciana es un paciente de demostración: su historia es inventada y la aplicación lo dice en pantalla.',
  },
  {
    tipo: 'grabacion',
    clip: 'clip-resumen.webm',
    voz: 'alex',
    texto:
      'Al abrir la ficha, lo primero son las dos cosas juntas: cuánto creció el ojo en doce meses, ojo por ojo y con su semáforo, y cuánto se usó el tratamiento. Juntas, porque por separado cada una engaña.',
  },
  {
    tipo: 'grabacion',
    clip: 'clip-pestanas.webm',
    voz: 'dora',
    texto:
      'La ficha se reparte en cuatro pestañas: resumen, gráficas, tratamientos y controles. Cada una se abre desde su propia pestaña.',
  },
  {
    tipo: 'grabacion',
    clip: 'clip-graficas.webm',
    voz: 'alex',
    texto:
      'Las gráficas. La longitud axial de los dos ojos a lo largo del tiempo, con una línea vertical donde empezó cada tratamiento, para ver si el cambio se notó. Debajo, la refracción.',
  },
  {
    tipo: 'grabacion',
    clip: 'clip-tratamientos.webm',
    voz: 'dora',
    texto:
      'El historial de tratamientos, completo. En esta historia de ejemplo el niño empezó con gafas de control; al año el ojo había crecido más de lo esperado con el uso por debajo de la meta, así que se revisó el uso antes de cambiar nada, y después se pasó a ortoqueratología. Eso es lo que la aplicación existe para hacer visible.',
  },
  {
    tipo: 'grabacion',
    clip: 'clip-consentimiento.webm',
    voz: 'alex',
    texto:
      'Y el consentimiento informado, en dos hojas con los datos del niño ya puestos. Se guarda en pedefe para mandárselo a la familia antes de la cita, o se imprime para firmarlo en consulta.',
  },
  {
    tipo: 'lamina',
    voz: 'dora',
    texto:
      'Todo esto está en seguimiento punto miopialatam punto org. El acceso es para profesionales de la red, por aprobación.',
    html: laminaCierre({
      titulo: 'seguimiento.miopialatam.org',
      sub: 'Acceso para profesionales de la red, por aprobación.',
    }),
  },
]

async function principal() {
  const carpeta = resolve(process.argv[2] ?? '.')
  if (!existsSync(CHROME)) throw new Error('No encuentro Google Chrome')

  rmSync(TEMPORAL, { recursive: true, force: true })
  mkdirSync(TEMPORAL, { recursive: true })
  mkdirSync(SALIDA, { recursive: true })

  console.log('Recorrido por la aplicacion')
  const tramos = []
  for (const [i, paso] of GUION.entries()) {
    const nombre = String(i + 1).padStart(2, '0')
    const hecho =
      paso.tipo === 'lamina'
        ? await tramoDeLamina(paso.html, paso.texto, paso.voz, TEMPORAL, nombre)
        : await tramoDeGrabacion(
            resolve(carpeta, paso.clip),
            paso.texto,
            paso.voz,
            TEMPORAL,
            nombre,
          )
    tramos.push(hecho.mp4)
    console.log(
      `   tramo ${nombre}  ${hecho.segundos.toFixed(1)} s  voz ${VOCES[paso.voz]}  ${paso.tipo}`,
    )
  }

  const lista = resolve(TEMPORAL, 'lista.txt')
  writeFileSync(lista, tramos.map((t) => `file '${t}'`).join('\n'))
  const final = resolve(SALIDA, 'recorrido-por-la-aplicacion.mp4')
  correr('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'concat', '-safe', '0', '-i', lista,
    '-c', 'copy', '-movflags', '+faststart',
    final,
  ])

  const total = duracionAudio(final)
  console.log(
    `\nlisto: ${final}  (${Math.floor(total / 60)}:${String(Math.round(total % 60)).padStart(2, '0')})`,
  )
  rmSync(TEMPORAL, { recursive: true, force: true })
}

principal().catch((error) => {
  console.error(error.message ?? error)
  process.exit(1)
})
