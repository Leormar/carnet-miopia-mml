/**
 * Plantilla de las laminas de los videos, con la identidad del Grupo Manejo
 * Miopia Latam: fondo crema, tinta oscura, Fraunces en los titulos, Inter en
 * el texto y las cuatro barras de color del carnet.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const raiz = resolve(process.cwd())

const fuente = (ruta) =>
  `url('data:font/woff2;base64,${readFileSync(resolve(raiz, ruta)).toString('base64')}')`

const LOGO = `data:image/png;base64,${readFileSync(resolve(raiz, 'referencia/logo.png')).toString('base64')}`

const FRAUNCES = fuente('node_modules/@fontsource/fraunces/files/fraunces-latin-600-normal.woff2')
const INTER_400 = fuente('node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2')
const INTER_600 = fuente('node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2')

export const COLOR = {
  crema: '#faf8f3',
  tinta: '#111c26',
  gris: '#5b6570',
  grisMedio: '#3d4955',
  borde: '#ddd6c8',
  magenta: '#e2104f',
  azul: '#1fa3dd',
  amarillo: '#f5c400',
  verde: '#5a9a3a',
  semVerde: '#e6f2df',
  semAmarillo: '#fdf3c4',
  semRojo: '#fbe3ea',
}

const BASE = `
@font-face{font-family:Fraunces;font-weight:600;src:${FRAUNCES}}
@font-face{font-family:Inter;font-weight:400;src:${INTER_400}}
@font-face{font-family:Inter;font-weight:600;src:${INTER_600}}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1920px;height:1080px;overflow:hidden}
body{background:${COLOR.crema};color:${COLOR.tinta};font-family:Inter;
     display:flex;flex-direction:column;padding:72px 96px}
.barras{display:flex;gap:10px}
.barras i{width:72px;height:10px;display:block;border-radius:2px}
h1{font-family:Fraunces;font-weight:600;font-size:92px;line-height:1.05;letter-spacing:-.5px}
h2{font-family:Fraunces;font-weight:600;font-size:68px;line-height:1.1}
.sub{font-size:34px;color:${COLOR.gris};line-height:1.35;margin-top:22px;max-width:1500px}
.lienzo{flex:1;display:flex;flex-direction:column;min-height:0}
.lienzo.centrado{justify-content:center}
.lienzo.arriba{justify-content:center}
.pie{display:flex;align-items:flex-end;justify-content:space-between;
     padding-top:28px;font-size:22px;color:${COLOR.gris}}
.marca{display:flex;align-items:center;gap:18px}
.marca img{width:64px;height:64px;border-radius:50%;background:#fff;
           box-shadow:0 2px 10px rgba(17,28,38,.12)}
.marca span{font-family:Fraunces;font-weight:600;font-size:26px;color:${COLOR.tinta}}
ul{list-style:none;margin-top:48px;display:flex;flex-direction:column;gap:26px;max-width:1560px}
li{display:flex;gap:22px;align-items:flex-start;font-size:38px;line-height:1.3;color:${COLOR.grisMedio}}
li b{color:${COLOR.tinta};font-weight:600}
.punto{width:18px;height:18px;border-radius:50%;margin-top:16px;flex:none}
.tarjetas{display:grid;grid-template-columns:repeat(2,1fr);gap:28px;margin-top:52px}
.tarjeta{background:#fff;border:1px solid ${COLOR.borde};border-radius:18px;padding:30px 34px;
         border-top:10px solid}
.tarjeta h3{font-family:Fraunces;font-weight:600;font-size:40px;margin-bottom:10px}
.tarjeta p{font-size:28px;line-height:1.3;color:${COLOR.grisMedio}}
.frase{font-family:Fraunces;font-weight:600;font-size:132px;line-height:1.02;
       letter-spacing:-1px;max-width:1560px}
.frase small{display:block;font-family:Inter;font-weight:400;font-size:34px;color:${COLOR.gris};
             margin-top:34px;letter-spacing:0}
.semaforos{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;margin-top:52px}
.sem{border-radius:18px;padding:30px 32px}
.sem b{display:block;font-family:Fraunces;font-size:38px;margin-bottom:12px}
.sem span{font-size:27px;line-height:1.3;color:${COLOR.grisMedio}}
.dato{font-family:Fraunces;font-weight:600;font-size:150px;line-height:1;color:${COLOR.magenta}}
.fuente{font-size:22px;color:${COLOR.gris};margin-top:40px}
`

function barras() {
  return `<div class="barras">
    <i style="background:${COLOR.amarillo}"></i><i style="background:${COLOR.verde}"></i>
    <i style="background:${COLOR.azul}"></i><i style="background:${COLOR.magenta}"></i>
  </div>`
}

function pie(texto = 'seguimiento.miopialatam.org') {
  return `<div class="pie">
    <div class="marca"><img src="${LOGO}"><span>Grupo Manejo Miopía Latam</span></div>
    <div>${texto}</div>
  </div>`
}

function documento(cuerpo) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${BASE}</style></head><body>${cuerpo}</body></html>`
}

/** Portada: logo grande, titulo y subtitulo. */
export function laminaPortada({ titulo, sub }) {
  return documento(`
    ${barras()}
    <div class="lienzo centrado">
      <img src="${LOGO}" style="width:140px;height:140px;border-radius:50%;background:#fff;
           box-shadow:0 4px 20px rgba(17,28,38,.14);margin-bottom:44px">
      <h1>${titulo}</h1>
      ${sub ? `<p class="sub">${sub}</p>` : ''}
    </div>
    ${pie()}`)
}

/** Frase grande, para los golpes del trailer. */
export function laminaFrase({ frase, nota }) {
  return documento(`
    ${barras()}
    <div class="lienzo centrado"><div class="frase">${frase}${nota ? `<small>${nota}</small>` : ''}</div></div>
    ${pie()}`)
}

/** Titulo con lista de puntos. */
export function laminaPuntos({ titulo, sub, puntos, colores }) {
  const paleta = colores ?? [COLOR.amarillo, COLOR.verde, COLOR.azul, COLOR.magenta]
  return documento(`
    ${barras()}
    <div class="lienzo arriba">
      <h2>${titulo}</h2>
      ${sub ? `<p class="sub">${sub}</p>` : ''}
      <ul>${puntos
        .map(
          (p, i) =>
            `<li><span class="punto" style="background:${paleta[i % paleta.length]}"></span><span>${p}</span></li>`,
        )
        .join('')}</ul>
    </div>
    ${pie()}`)
}

/** Las cuatro tarjetas de tratamiento, con su color. */
export function laminaTarjetas({ titulo, sub, tarjetas, fuente: cita }) {
  return documento(`
    ${barras()}
    <div class="lienzo arriba">
      <h2>${titulo}</h2>
      ${sub ? `<p class="sub">${sub}</p>` : ''}
      <div class="tarjetas">
        ${tarjetas
          .map(
            (t) =>
              `<div class="tarjeta" style="border-top-color:${t.color}">
                 <h3>${t.titulo}</h3><p>${t.texto}</p>
               </div>`,
          )
          .join('')}
      </div>
      ${cita ? `<p class="fuente">${cita}</p>` : ''}
    </div>
    ${pie()}`)
}

/** Las tres franjas del semaforo del carnet. */
export function laminaSemaforo({ titulo, sub, franjas, fuente: cita }) {
  return documento(`
    ${barras()}
    <div class="lienzo arriba">
      <h2>${titulo}</h2>
      ${sub ? `<p class="sub">${sub}</p>` : ''}
      <div class="semaforos">
        ${franjas
          .map((f) => `<div class="sem" style="background:${f.fondo}"><b>${f.titulo}</b><span>${f.texto}</span></div>`)
          .join('')}
      </div>
      ${cita ? `<p class="fuente">${cita}</p>` : ''}
    </div>
    ${pie()}`)
}

/** Una cifra grande con su referencia. */
export function laminaDato({ dato, texto, fuente: cita }) {
  return documento(`
    ${barras()}
    <div class="lienzo centrado">
      <div class="dato">${dato}</div>
      <p class="sub" style="font-size:44px;color:${COLOR.tinta};max-width:1400px">${texto}</p>
      ${cita ? `<p class="fuente">${cita}</p>` : ''}
    </div>
    ${pie()}`)
}

/** Cierre. */
export function laminaCierre({ titulo, sub }) {
  return documento(`
    ${barras()}
    <div class="lienzo centrado">
      <img src="${LOGO}" style="width:120px;height:120px;border-radius:50%;background:#fff;
           box-shadow:0 4px 20px rgba(17,28,38,.14);margin-bottom:40px">
      <h1>${titulo}</h1>
      <p class="sub" style="font-size:40px;color:${COLOR.tinta}">${sub}</p>
      <p class="fuente">Este contenido es educativo y no reemplaza una valoracion visual individual.</p>
    </div>
    ${pie()}`)
}
