/**
 * Replica del carnet de papel del Grupo Manejo Miopia Latam, con los datos del
 * paciente ya impresos. Mismas dos paginas A4 horizontal, mismos colores,
 * mismas fuentes y mismos textos que referencia/carnet.html.
 */

import { TRATAMIENTOS, ORDEN_TRATAMIENTOS, type TipoTratamiento } from '@/config/tratamientos'
import { META_LONGITUD_AXIAL } from '@/config/umbrales-clinicos'
import { SITIO } from '@/config/sitio'
import { fechaCorta } from '@/lib/clinica/edad'
import { formatoMm } from '@/lib/clinica/crecimiento'
import { formatoRefraccion } from '@/lib/clinica/refraccion'

export interface FilaCarnet {
  fecha: string
  edad: number
  avOd: string | null
  avOi: string | null
  refraccionOd: string
  refraccionOi: string
  alOd: string | null
  alOi: string | null
  crecimientoOd: number | null
  crecimientoOi: number | null
  equipo: string | null
  horasUso: string | null
  aireLibre: string | null
  proximoControl: string | null
}

export interface FilaTratamientoCarnet {
  fecha: string
  hallazgos: string
  molestias: string
  decision: string
}

export interface DatosCarnet {
  nombre: string
  fechaNacimiento: string
  edadInicioMiopia: string | null
  padresMiopes: number | null
  tiposActivos: TipoTratamiento[]
  fechaInicioTratamiento: string | null
  profesional: string | null
  oftalmologo: string | null
  filas: FilaCarnet[]
  filasTratamiento: FilaTratamientoCarnet[]
}

const FILAS_CONTROLES = 13
const FILAS_TRATAMIENTO = 7

const CSS = `
.carnet-raiz{--borde:#ddd6c8;--gris:#5b6570}
.carnet-página{width:297mm;height:210mm;padding:12mm 14mm;position:relative;background:#faf8f3;overflow:hidden;color:#111c26;font-family:var(--fuente-texto)}
.carnet-página + .carnet-página{margin-top:6mm}
.carnet-hd{display:flex;align-items:center;gap:12px}
.carnet-hd img{width:46px;height:46px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.12)}
.carnet-hd .t{font-family:var(--fuente-titulo);font-weight:600;font-size:24px;line-height:1.15}
.carnet-hd .s{font-size:11px;color:var(--gris)}
.carnet-bars{display:flex;gap:5px;margin:8px 0}
.carnet-bars i{width:26px;height:4px;display:block}
.carnet-página h3{font-family:var(--fuente-titulo);font-weight:600;font-size:15px;margin:8px 0 5px}
.carnet-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.carnet-f{background:#fff;border:1px solid var(--borde);border-radius:6px;padding:5px 8px;font-size:9.5px;color:var(--gris);height:34px;overflow:hidden}
.carnet-f b{display:block;font-weight:600;color:#111c26;font-size:10px}
.carnet-f .v{color:#111c26;font-size:10.5px;font-weight:500}
.carnet-página table{width:100%;border-collapse:collapse;background:#fff;font-size:9px}
.carnet-página th{background:#111c26;color:#fff;font-weight:600;padding:4px 3px;text-align:center;line-height:1.2}
.carnet-página td{border:1px solid var(--borde);height:31px;padding:2px 4px;text-align:center;font-size:8.5px;vertical-align:middle}
.carnet-pagina td.izq{text-align:left}
.carnet-ft{position:absolute;left:14mm;right:14mm;bottom:7mm;font-size:8.5px;color:var(--gris);display:flex;justify-content:space-between}
.carnet-cols{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.carnet-card{background:#fff;border-radius:8px;padding:8px 10px;border-top:5px solid}
.carnet-card h4{font-family:var(--fuente-titulo);font-weight:600;font-size:13px;margin-bottom:3px}
.carnet-card p{font-size:10px;line-height:1.35;color:#3d4955}
.carnet-card .cal{font-size:9.5px;font-weight:600;color:#111c26;margin:3px 0}
.carnet-sem{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:4px}
.carnet-sem div{border-radius:8px;padding:7px 9px;font-size:9.5px;line-height:1.35;color:#111c26}
.carnet-sem b{display:block;font-size:11px;margin-bottom:2px}
.carnet-chk{font-size:9px}
.carnet-chk .on{font-weight:700;color:#111c26;text-decoration:underline}
.carnet-chk .off{color:#9aa3ac}
@media print{
  .carnet-pagina{page-break-after:always;margin:0 !important}
  .carnet-pagina:last-child{page-break-after:auto}
}
`

const CALENDARIOS: Record<TipoTratamiento, string> = {
  gafas: '1 mes · 6 meses · 1 año',
  lentes_blandos: '1 semana · 1 mes · 6 meses · 1 año',
  ortok: '1 día · 1 semana · 1 mes · 3 meses · 6 meses · 1 año',
  atropina: '1 día · 1 semana · 1 mes · 3 meses · 6 meses · 1 año',
}

function Cabecera({ titulo, subtitulo }: { titulo: string; subtitulo: string }) {
  return (
    <>
      <div className="carnet-hd">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" />
        <div>
          <div className="t">{titulo}</div>
          <div className="s">{subtitulo}</div>
        </div>
      </div>
      <div className="carnet-bars">
        <i style={{ background: '#f5c400' }} />
        <i style={{ background: '#5a9a3a' }} />
        <i style={{ background: '#1fa3dd' }} />
        <i style={{ background: '#e2104f' }} />
      </div>
    </>
  )
}

function Dato({ titulo, valor, extra }: { titulo: string; valor?: string | null; extra?: React.ReactNode }) {
  return (
    <div className="carnet-f">
      <b>{titulo}</b>
      {extra ?? <span className="v">{valor ?? ''}</span>}
    </div>
  )
}

export function Carnet({ datos }: { datos: DatosCarnet }) {
  const filas = [...datos.filas]
  while (filas.length < FILAS_CONTROLES) filas.push(null as unknown as FilaCarnet)

  const filasT = [...datos.filasTratamiento]
  while (filasT.length < FILAS_TRATAMIENTO) filasT.push(null as unknown as FilaTratamientoCarnet)

  const padres =
    datos.padresMiopes === null
      ? null
      : (['Ninguno', 'Uno', 'Dos'] as const)[datos.padresMiopes]

  return (
    <div className="carnet-raiz">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Pagina 1 */}
      <div className="carnet-pagina">
        <Cabecera
          titulo="Carnet de seguimiento del control de miopía"
          subtitulo={`${SITIO.organizacion} · Llevelo a todos los controles, con el optometra y con el oftalmologo`}
        />

        <h3>Datos de base</h3>
        <div className="carnet-grid">
          <Dato titulo="Nombre" valor={datos.nombre} />
          <Dato titulo="Fecha de nacimiento" valor={fechaCorta(datos.fechaNacimiento)} />
          <Dato titulo="Edad al inicio de la miopía" valor={datos.edadInicioMiopia} />
          <Dato
            titulo="Padres miopes"
            extra={
              <span className="carnet-chk">
                {(['Ninguno', 'Uno', 'Dos'] as const).map((p, i) => (
                  <span key={p}>
                    <span className={padres === p ? 'on' : 'off'}>{p}</span>
                    {i < 2 ? ' · ' : ''}
                  </span>
                ))}
              </span>
            }
          />
          <Dato
            titulo="Tratamiento"
            extra={
              <span className="carnet-chk">
                {ORDEN_TRATAMIENTOS.map((t, i) => (
                  <span key={t}>
                    <span className={datos.tiposActivos.includes(t) ? 'on' : 'off'}>
                      {TRATAMIENTOS[t].nombreCorto}
                    </span>
                    {i < ORDEN_TRATAMIENTOS.length - 1 ? ' · ' : ''}
                  </span>
                ))}
                {datos.tiposActivos.length > 1 && <span className="on"> · Combinado</span>}
              </span>
            }
          />
          <Dato
            titulo="Fecha de inicio"
            valor={datos.fechaInicioTratamiento ? fechaCorta(datos.fechaInicioTratamiento) : ''}
          />
          <Dato titulo="Profesional / consultorio" valor={datos.profesional} />
          <Dato titulo="Oftalmología pediátrica" valor={datos.oftalmologo} />
        </div>

        <h3>Controles</h3>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Edad</th>
              <th>AV OD / OI</th>
              <th>Refracción ciclopléjica OD</th>
              <th>Refracción ciclopléjica OI</th>
              <th>Longitud axial OD (mm)</th>
              <th>Longitud axial OI (mm)</th>
              <th>Crecimiento en 12 meses OD / OI</th>
              <th>Equipo de medición</th>
              <th>Horas de uso / aire libre</th>
              <th>Próximo control</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => (
              <tr key={i}>
                <td>{f ? fechaCorta(f.fecha) : ''}</td>
                <td>{f ? f.edad : ''}</td>
                <td>{f ? [f.avOd, f.avOi].filter(Boolean).join(' / ') : ''}</td>
                <td>{f?.refraccionOd ?? ''}</td>
                <td>{f?.refraccionOi ?? ''}</td>
                <td>{f?.alOd ?? ''}</td>
                <td>{f?.alOi ?? ''}</td>
                <td>
                  {f && (f.crecimientoOd !== null || f.crecimientoOi !== null)
                    ? `${f.crecimientoOd !== null ? formatoMm(f.crecimientoOd) : '-'} / ${f.crecimientoOi !== null ? formatoMm(f.crecimientoOi) : '-'}`
                    : ''}
                </td>
                <td>{f?.equipo ?? ''}</td>
                <td>
                  {f ? [f.horasUso, f.aireLibre].filter(Boolean).join(' / ') : ''}
                </td>
                <td>{f?.proximoControl ? fechaCorta(f.proximoControl) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="carnet-ft">
          <span>Educativo. No reemplaza la valoración visual individual.</span>
          <span>{SITIO.substack}</span>
        </div>
      </div>

      {/* Pagina 2 */}
      <div className="carnet-pagina">
        <Cabecera
          titulo="Que revisar según el tratamiento"
          subtitulo="Calendario del primer año. Luego, control cada 6 meses. Refracción ciclopléjica y longitud axial cada 6 meses; examen completo con fondo de ojo cada año."
        />

        <div className="carnet-cols">
          {(['gafas', 'lentes_blandos', 'ortok', 'atropina'] as TipoTratamiento[]).map((t) => (
            <div key={t} className="carnet-card" style={{ borderColor: TRATAMIENTOS[t].color }}>
              <h4>{TRATAMIENTOS[t].nombre}</h4>
              <div className="cal">{CALENDARIOS[t]}</div>
              <p>{TRATAMIENTOS[t].queRevisar}</p>
            </div>
          ))}
        </div>

        <h3>Cómo leer el crecimiento del ojo en 12 meses</h3>
        <div className="carnet-sem">
          <div style={{ background: '#e6f2df' }}>
            <b>Verde: como un ojo sin miopía</b>
            Hasta 0,2 mm/año entre 7 y 10 años · hasta 0,1 mm/año entre 11 y 16 años.
          </div>
          <div style={{ background: '#fdf3c4' }}>
            <b>Amarillo: mas de lo ideal</b>
            Se acerca a lo de un miope sin tratamiento: 0,3 mm/año a los 7-10 años · 0,2 mm/año a
            los 11-16. Revisar adherencia y habitos.
          </div>
          <div style={{ background: '#fbe3ea' }}>
            <b>Meta de largo plazo</b>
            Mantener el ojo por debajo de {String(META_LONGITUD_AXIAL.limiteMm).replace('.', ',')}{' '}
            mm. Que el percentil de longitud axial no siga subiendo.
          </div>
        </div>

        <h3>Registro especifico del tratamiento</h3>
        <table>
          <thead>
            <tr>
              <th style={{ width: '12%' }}>Fecha</th>
              <th style={{ width: '38%' }}>
                Hallazgos del tratamiento (ajuste, córnea, topografía, pupila, presión)
              </th>
              <th style={{ width: '25%' }}>Molestias o eventos</th>
              <th style={{ width: '25%' }}>Decisión</th>
            </tr>
          </thead>
          <tbody>
            {filasT.map((f, i) => (
              <tr key={i}>
                <td>{f ? fechaCorta(f.fecha) : ''}</td>
                <td className="izq">{f?.hallazgos ?? ''}</td>
                <td className="izq">{f?.molestias ?? ''}</td>
                <td className="izq">{f?.decision ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="carnet-ft">
          <span>
            Fuentes: IMI Clinical Management Guidelines 2019 · Consejo Mundial de Optometría ·
            Tideman 2016 y 2018 · Myopia Profile.
          </span>
          <span>
            {SITIO.organizacion} · {SITIO.substack}
          </span>
        </div>
      </div>
    </div>
  )
}

export { formatoRefraccion }
