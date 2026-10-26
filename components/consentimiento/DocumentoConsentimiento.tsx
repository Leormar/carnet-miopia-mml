/**
 * El consentimiento informado como documento imprimible: A4 vertical, para
 * enviar a la familia, firmar en papel o en pantalla, y archivar.
 *
 * Sirve en dos formas. En blanco, para mandarlo antes de la cita; y con los
 * datos del niño ya puestos, desde su ficha. La diferencia es solo si llegan
 * o no `datos`: el texto legal es el mismo en los dos casos, que es justo lo
 * que debe ser.
 */

import { CONSENTIMIENTO } from '@/config/consentimiento'
import { LEGAL } from '@/config/legal'
import { SITIO } from '@/config/sitio'

export interface DatosConsentimiento {
  /** Nombre del niño. Vacio en la version en blanco. */
  nombreMenor: string | null
  fechaNacimiento: string | null
  /** Quien lo atiende, para que la familia sepa a quien reclamarle. */
  profesional: string | null
  institucion: string | null
}

const CSS = `
.cons-raiz{--borde:#ddd6c8;--gris:#5b6570;color:#111c26;font-family:var(--fuente-texto)}
.cons-hoja{width:210mm;min-height:297mm;padding:16mm 18mm;background:#faf8f3;position:relative}
.cons-hoja + .cons-hoja{margin-top:6mm}
.cons-cinta{display:flex;gap:4px;margin-bottom:10mm}
.cons-cinta i{display:block;width:26px;height:4px;border-radius:2px}
.cons-hd{display:flex;align-items:flex-start;gap:12px;margin-bottom:7mm}
.cons-hd img{width:44px;height:44px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.12);flex:none}
.cons-hd h1{font-family:var(--fuente-titulo);font-weight:600;font-size:19px;line-height:1.2;margin:0}
.cons-hd p{font-size:10.5px;color:var(--gris);margin:3px 0 0;line-height:1.45}
.cons-entrada{font-size:11.5px;line-height:1.6;border:1px solid var(--borde);border-radius:8px;padding:8px 10px;background:#fff}
.cons-campos{display:grid;grid-template-columns:1fr 1fr;gap:5mm 8mm;margin:6mm 0}
.cons-campo{font-size:10px;color:var(--gris)}
.cons-campo b{display:block;font-size:12px;color:#111c26;font-weight:600;border-bottom:1px solid var(--borde);min-height:17px;padding-bottom:2px;margin-top:3px;font-family:var(--fuente-texto)}
.cons-campo .vacio{display:block;border-bottom:1px solid var(--borde);min-height:17px;margin-top:3px}
.cons-sec{margin-top:5mm;break-inside:avoid}
.cons-sec h2{font-family:var(--fuente-titulo);font-weight:600;font-size:13px;margin:0 0 2mm}
.cons-sec p{font-size:10.5px;line-height:1.55;margin:0 0 2mm;color:#2b3a47}
.cons-lista{margin:0;padding-left:15px;list-style:disc}
.cons-lista li{font-size:10.5px;line-height:1.55;margin-bottom:1.5mm;color:#2b3a47}
.cons-derechos{border:1px solid var(--borde);border-radius:8px;padding:8px 10px;background:#fff;margin-top:5mm;break-inside:avoid}
.cons-decl{margin-top:5mm;break-inside:avoid}
.cons-casilla{display:flex;gap:7px;align-items:flex-start;margin-bottom:2.5mm}
.cons-casilla i{display:block;width:11px;height:11px;border:1.4px solid #111c26;border-radius:2px;flex:none;margin-top:2px}
.cons-casilla span{font-size:10.5px;line-height:1.5}
.cons-firmas{display:grid;grid-template-columns:1fr 1fr;gap:6mm 10mm;margin-top:10mm;break-inside:avoid}
.cons-firma{border-top:1px solid #111c26;padding-top:2.5px;font-size:9.5px;color:var(--gris)}
.cons-firma b{display:block;font-size:10.5px;color:#111c26;font-weight:600}
.cons-pie{position:absolute;left:18mm;right:18mm;bottom:10mm;display:flex;justify-content:space-between;align-items:flex-end;gap:10px;font-size:8.5px;color:var(--gris);border-top:1px solid var(--borde);padding-top:2.5mm}
@media print{
  @page{size:A4 portrait;margin:0}
  .cons-hoja{background:#faf8f3;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .cons-hoja + .cons-hoja{margin-top:0;break-before:page}
}
`

function Campo({ rotulo, valor }: { rotulo: string; valor?: string | null }) {
  return (
    <div className="cons-campo">
      {rotulo}
      {valor ? <b>{valor}</b> : <span className="vacio" />}
    </div>
  )
}

function Firma({ rotulo, nota }: { rotulo: string; nota: string }) {
  return (
    <div className="cons-firma">
      <b>{rotulo}</b>
      {nota}
    </div>
  )
}

export function DocumentoConsentimiento({ datos }: { datos: DatosConsentimiento }) {
  return (
    <div className="cons-raiz">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Hoja 1: quien, que datos, para que, quien los ve, donde, cuanto tiempo. */}
      <article className="cons-hoja">
        <div className="cons-cinta">
          <i style={{ background: '#f5c400' }} />
          <i style={{ background: '#5a9a3a' }} />
          <i style={{ background: '#1fa3dd' }} />
          <i style={{ background: '#e2104f' }} />
        </div>

        <header className="cons-hd">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" />
          <div>
            <h1>{CONSENTIMIENTO.titulo}</h1>
            <p>{CONSENTIMIENTO.bajada}</p>
          </div>
        </header>

        <p className="cons-entrada">{CONSENTIMIENTO.entrada}</p>

        <div className="cons-campos">
          <Campo rotulo="Nombre del menor" valor={datos.nombreMenor} />
          <Campo rotulo="Fecha de nacimiento" valor={datos.fechaNacimiento} />
          <Campo rotulo="Documento del menor (si aplica)" />
          <Campo rotulo="Profesional tratante" valor={datos.profesional} />
          <Campo rotulo="Institución o consulta" valor={datos.institucion} />
          <Campo rotulo="Ciudad y fecha" />
        </div>

        {CONSENTIMIENTO.secciones.map((s) => (
          <section className="cons-sec" key={s.titulo}>
            <h2>{s.titulo}</h2>
            {s.parrafos.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        ))}

        <footer className="cons-pie">
          <span>
            {LEGAL.responsable} · {SITIO.dominio} · {LEGAL.correoDatos}
          </span>
          <span>
            Versión {LEGAL.version} · Hoja 1 de 2
          </span>
        </footer>
      </article>

      {/* Hoja 2: los derechos, lo que se declara y las firmas. */}
      <article className="cons-hoja">
        <div className="cons-cinta">
          <i style={{ background: '#f5c400' }} />
          <i style={{ background: '#5a9a3a' }} />
          <i style={{ background: '#1fa3dd' }} />
          <i style={{ background: '#e2104f' }} />
        </div>

        <div className="cons-derechos">
          <h2
            style={{
              fontFamily: 'var(--fuente-titulo)',
              fontWeight: 600,
              fontSize: 13,
              margin: '0 0 2mm',
            }}
          >
            {CONSENTIMIENTO.derechos.titulo}
          </h2>
          <p style={{ fontSize: 10.5, lineHeight: 1.55, margin: '0 0 2mm' }}>
            {CONSENTIMIENTO.derechos.entrada}
          </p>
          <ul className="cons-lista">
            {CONSENTIMIENTO.derechos.puntos.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p style={{ fontSize: 10.5, lineHeight: 1.55, margin: '2mm 0 0' }}>
            {CONSENTIMIENTO.derechos.cierre}
          </p>
        </div>

        <section className="cons-decl">
          <h2
            style={{
              fontFamily: 'var(--fuente-titulo)',
              fontWeight: 600,
              fontSize: 13,
              margin: '0 0 3mm',
            }}
          >
            Declaro
          </h2>
          {CONSENTIMIENTO.declaracion.map((d) => (
            <div className="cons-casilla" key={d}>
              <i />
              <span>{d}</span>
            </div>
          ))}
          <div className="cons-casilla">
            <i />
            <span>
              <b>Autorizo</b> el tratamiento de los datos personales y de salud del menor en los
              términos de este documento.
            </span>
          </div>
        </section>

        <div className="cons-campos" style={{ marginTop: '6mm' }}>
          <Campo rotulo="Nombre de quien autoriza" />
          <Campo rotulo="Documento de identidad" />
          <Campo rotulo="Parentesco con el menor" />
          <Campo rotulo="Teléfono o correo de contacto" />
        </div>

        <div className="cons-firmas">
          <Firma rotulo="Firma del padre, madre o representante legal" nota="Fecha:" />
          <Firma rotulo="Firma del profesional que recoge la autorización" nota="Registro profesional:" />
        </div>

        <p style={{ fontSize: 9, color: '#5b6570', marginTop: '8mm', lineHeight: 1.5 }}>
          {CONSENTIMIENTO.nota} Esta autorización se registra en la aplicación con su versión, la
          fecha y quien la otorgó. La familia puede pedir copia de este documento firmado en
          cualquier momento.
        </p>

        <footer className="cons-pie">
          <span>
            {LEGAL.responsable} · {SITIO.dominio} · {LEGAL.correoDatos}
          </span>
          <span>
            Versión {LEGAL.version} · Hoja 2 de 2
          </span>
        </footer>
      </article>
    </div>
  )
}
