# Seguimiento MML — App de seguimiento y adherencia en control de miopía

## Qué es

Una app web que es el carnet de seguimiento del Grupo Manejo Miopía Latam (MML) en versión digital. El carnet no reemplaza nada: no existía antes, lo creó el grupo, y nace en dos formas, la hoja impresa que la familia lleva a la cita y esta aplicación, que calcula lo que el papel no calcula. Sirve para que el profesional y la familia registren los controles del niño en tratamiento para desacelerar la miopía, vean si el ojo está creciendo dentro de lo esperado y, sobre todo, sostengan la **adherencia** al tratamiento.

Principio rector: **si no se usa, no funciona.** La app debe hacer visible el uso real del dispositivo (horas de gafas o lentes blandos, noches de ortoqueratología, gotas de atropina) junto al resultado (longitud axial y refracción).

Debe ser **independiente de la marca**: sirve para cualquier dispositivo, y un mismo niño puede cambiar o combinar tratamientos sin perder su historia.

Autor clínico: Leonardo Orjuela Mariño, optómetra, miembro fundador de MML. Idioma de la interfaz: español (Latinoamérica). Sin emojis en ningún lugar.

## Material de referencia en esta carpeta

- `referencia/carnet.html`, `carnet-seguimiento-miopia-mml.pdf`, `carnet-pagina1-mml.png`, `carnet-pagina2-mml.png`: el carnet de papel. La app debe poder exportar un PDF con este mismo diseño.
- `referencia/post-adherencia-carnet.md`: el post de Substack con la evidencia y las referencias verificadas.
- `referencia/logo.png`: logo de Grupo Manejo Miopía Latam. Debe aparecer en la app y en el PDF.

## Stack

- Next.js 14 (App Router) + TypeScript
- Neon Serverless PostgreSQL (ORM: Drizzle, salvo que se acuerde otro)
- NextAuth (correo con enlace mágico; luego Google)
- Vercel para despliegue; GitHub usuario Leormar
- Gráficas: Recharts
- PDF: Playwright o @react-pdf/renderer, replicando `carnet.html`

## Identidad visual (MML)

- Fondo claro `#faf8f3` (nunca fondos oscuros), tinta `#111c26`
- Acentos: magenta `#e2104f`, azul `#1fa3dd`, amarillo `#f5c400`, verde `#5a9a3a`
- Títulos en Fraunces, texto en Inter
- Colores por tratamiento: gafas azul, lentes blandos magenta, ortoqueratología verde, atropina amarillo
- Iconografía SVG profesional, sin emojis. Diseño responsive, pensado primero para celular (los padres lo usarán desde el teléfono)

## Usuarios y roles

1. **Profesional** (optómetra u oftalmólogo): crea pacientes, registra controles, elige tratamiento, ve el panel de todos sus pacientes.
2. **Familia** (padre, madre o cuidador): ve el carnet de su hijo, registra el uso diario y recibe recordatorios. No edita datos clínicos.
3. **Profesional invitado** (por ejemplo oftalmopediatría): acceso de lectura a un paciente mediante enlace o código QR que genera la familia o el profesional, con vencimiento.

Un niño puede tener más de un profesional tratante.

## Datos

**Paciente (datos de base):** nombre, fecha de nacimiento, sexo, edad de inicio de la miopía, número de padres miopes (0, 1, 2), profesional tratante, oftalmólogo, institución.

**Tratamiento:** tipo (gafas para control de miopía, lentes de contacto blandos, ortoqueratología, atropina en baja dosis, combinado), dispositivo o concentración (texto libre, sin catálogo de marcas obligatorio), fecha de inicio, fecha de fin, motivo de cambio. Historial completo; puede haber más de uno activo (por ejemplo orto-k + atropina).

**Control:** fecha, edad (calculada), agudeza visual OD/OI, refracción bajo cicloplejía OD/OI (esfera, cilindro, eje; equivalente esférico calculado), longitud axial OD/OI en mm con dos decimales, **equipo de biometría** (obligatorio, para comparar siempre con el mismo), horas de uso reportadas, tiempo al aire libre, tiempo de pantallas, hallazgos específicos del tratamiento (ajuste, córnea, topografía, pupila, presión), molestias o eventos, decisión, fecha del próximo control.

**Registro de uso (familia):** según el tratamiento activo:
- Gafas o lentes blandos: horas de uso del día
- Ortoqueratología: noche sí/no
- Atropina: gota sí/no
- Opcional: minutos al aire libre, molestias

## Lógica clínica

### Calendario de controles por tratamiento
Al iniciar un tratamiento, generar el calendario del primer año (Consejo Mundial de Optometría):

| Tratamiento | Controles del primer año |
|---|---|
| Gafas | 1 mes, 6 meses, 1 año |
| Lentes blandos | 1 semana, 1 mes, 6 meses, 1 año |
| Ortoqueratología | 1 día, 1 semana, 1 mes, 3 meses, 6 meses, 1 año |
| Atropina | 1 día, 1 semana, 1 mes, 3 meses, 6 meses, 1 año |

Después, cada 6 meses. Refracción ciclopléjica y longitud axial cada 6 meses; examen completo con fondo de ojo cada año.

**El calendario debe ser configurable por cada profesional o institución.** Ejemplo, protocolo de ortoqueratología de la práctica de Leo: primera noche, control a la mañana siguiente con los lentes puestos, 15 días, 1 mes, 3 meses, luego cada 6 meses con biometría y topografía; reemplazo del lente cada año.

### Crecimiento del ojo
- Calcular el crecimiento de longitud axial **anualizado** entre controles y el de los últimos 12 meses, por ojo.
- Alertar si el equipo de biometría cambió entre los dos controles comparados.

### Semáforo (crecimiento en 12 meses)
Referencia: Myopia Profile (Gifford) y post de MML.
- 7 a 10 años: verde ≤ 0,2 mm/año (como un ojo sin miopía); rojo ≥ 0,3 mm/año (como un miope sin tratamiento); amarillo entre ambos.
- 11 a 16 años: verde ≤ 0,1 mm/año; rojo ≥ 0,2 mm/año; amarillo entre ambos.
- Menores de 7 o mayores de 16: mostrar el dato sin semáforo y con nota.
- Meta de largo plazo: longitud axial < 26 mm (Tideman 2016). Mostrar aviso al acercarse o superarla.

Los umbrales deben vivir en un archivo de configuración con su fuente citada, no quemados en el código.

### Percentiles
Fase 2. **No inventar curvas.** Solo se implementan cuando Leo entregue la tabla de percentiles con su fuente (por ejemplo Tideman 2018). Mientras tanto, no mostrar percentil.

### Adherencia
- Porcentaje de días o noches cumplidos en los últimos 7, 30 y 90 días, y promedio de horas para gafas y lentes blandos.
- Metas por defecto, editables por el profesional: gafas 12 h/día; lentes blandos según indicación (por defecto 10 h/día, 6 días/semana); orto-k todas las noches; atropina todas las noches.
- En la vista del control, mostrar **juntos** la adherencia del período y el crecimiento del ojo. Si el ojo creció más de lo esperado y la adherencia fue baja, sugerir revisar uso antes de cambiar de tratamiento (texto informativo, nunca una decisión automática).

### Recordatorios
- Próximo control (correo; WhatsApp en fase posterior)
- Recordatorio diario opcional para la familia (gota, lentes, registro de horas)

## Vistas

1. **Panel del profesional:** lista de pacientes con semáforo, adherencia de 30 días, próximo control y controles vencidos.
2. **Ficha del paciente:** datos de base, tratamientos (línea de tiempo), gráfica de longitud axial OD/OI en el tiempo con el inicio de cada tratamiento marcado, gráfica de refracción, tabla de controles.
3. **Nuevo control:** formulario rápido, pensado para llenar en consulta en menos de 2 minutos.
4. **Vista de la familia:** carnet resumido, botón grande para registrar el uso de hoy, adherencia de la semana, próximo control.
5. **Exportar:** PDF con el diseño de `carnet.html` y enlace/QR de solo lectura.

## Privacidad y regulación (Colombia)

- Datos de salud de menores: Ley 1581 de 2012 y Decreto 1377 de 2013. Consentimiento informado del padre, madre o representante al crear el paciente, con registro de fecha y versión.
- Bitácora de auditoría: quién creó, modificó o consultó cada registro.
- Enlaces compartidos con vencimiento y revocables.
- Cifrado en tránsito; secretos solo en variables de entorno.
- La app registra y calcula; **no diagnostica ni decide tratamientos**. Todo texto de sugerencia lleva la nota "Este contenido es educativo y no reemplaza una valoración visual individual."
- Interoperabilidad (Resolución 866 de 2021, FHIR): fase posterior; diseñar el modelo para que pueda mapearse.

## Fases

**MVP:**
1. Auth y roles (profesional, familia)
2. Pacientes, tratamientos y controles
3. Cálculo de crecimiento y semáforo
4. Gráfica de longitud axial
5. Registro diario de uso y adherencia
6. Calendario automático de controles
7. Exportar PDF del carnet

**Fase 2:** enlace/QR para oftalmopediatría, recordatorios por correo, calendarios configurables por institución, percentiles (con tabla verificada).

**Fase 3:** WhatsApp (integración con Aria), multi-institución para toda la red MML, FHIR, panel agregado anónimo para investigación.

## Reglas de trabajo

- Pedir confirmación a Leo antes de cada commit.
- Comandos para copiar y pegar, paso a paso.
- No inventar datos clínicos, umbrales ni referencias: si falta un dato, preguntar.
- Antes de programar, proponer el esquema de base de datos y la estructura de carpetas y esperar aprobación.
