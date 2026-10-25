# Carnet MML

Carnet y seguimiento del control de miopia del Grupo Manejo Miopia Latam.
Aplicacion web en `seguimiento.miopialatam.org`.

Principio rector: **si no se usa, no funciona.** La aplicacion hace visible el uso
real del dispositivo (noches de ortoqueratologia, horas de gafas o lentes blandos,
gotas de atropina) junto al resultado (longitud axial y refraccion).

La aplicacion registra y calcula; no diagnostica ni decide tratamientos.

## Stack

- Next.js 14 (App Router) + TypeScript
- Neon Serverless Postgres con Drizzle
- NextAuth v5 con Google y Apple, acceso cerrado por aprobacion
- Recharts para las graficas
- Vercel para el despliegue

## Puesta en marcha, paso a paso

### 1. Base de datos en Neon

1. Entre a <https://console.neon.tech> y cree un proyecto llamado `carnet-mml`,
   region `AWS US East (Ohio)` o la mas cercana.
2. Copie la cadena **Pooled connection**.
3. Peguela en `.env.local` en `DATABASE_URL`.

### 2. Secreto de sesion

```bash
cd ~/Desktop/carnet-miopia-mml
npx auth secret
```

Copie el valor que imprime y peguelo en `AUTH_SECRET` dentro de `.env.local`.

### 3. Credenciales de Google

1. <https://console.cloud.google.com> → cree el proyecto `carnet-mml`.
2. **APIs y servicios → Pantalla de consentimiento de OAuth**: tipo Externo,
   nombre `Carnet MML`, correo de soporte el suyo.
3. **Credenciales → Crear credenciales → ID de cliente de OAuth → Aplicacion web.**
4. En **URI de redireccionamiento autorizados** agregue las dos:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://seguimiento.miopialatam.org/api/auth/callback/google`
5. Copie el ID y el secreto a `AUTH_GOOGLE_ID` y `AUTH_GOOGLE_SECRET`.

### 4. Credenciales de Apple

Apple no entrega un secreto fijo: el `client secret` es un JWT firmado con una
llave `.p8`, y **vence a los 6 meses como maximo**. Por eso hay un script que lo
genera.

**4.1. En <https://developer.apple.com/account> → Certificates, Identifiers & Profiles**

1. **Identifiers → + → App IDs → App.**
   Description `Carnet MML`, Bundle ID `org.miopialatam.seguimiento.app`.
   Marque **Sign in with Apple**. Guarde.
2. **Identifiers → + → Services IDs.**
   Description `Carnet MML web`, Identifier `org.miopialatam.seguimiento`.
   Este identificador es el `AUTH_APPLE_ID`.
3. Abra ese Services ID → **Sign in with Apple → Configure**:
   - Primary App ID: el del paso 1
   - Domains and Subdomains: `seguimiento.miopialatam.org`
   - Return URLs: `https://seguimiento.miopialatam.org/api/auth/callback/apple`
4. **Keys → + .** Nombre `Carnet MML`, marque **Sign in with Apple**, elija el
   Primary App ID, **Continue → Register** y **descargue el archivo
   `AuthKey_XXXXXXXXXX.p8`**. Apple lo deja descargar una sola vez. Anote el
   **Key ID**.
5. Anote el **Team ID**: aparece arriba a la derecha de la pagina de la cuenta.

**4.2. Genere el secreto**

```bash
cd ~/Desktop/carnet-miopia-mml
node scripts/apple-secret.mjs \
  --team-id TU_TEAM_ID \
  --key-id TU_KEY_ID \
  --services-id org.miopialatam.seguimiento \
  --p8 ~/Downloads/AuthKey_TU_KEY_ID.p8
```

Imprime las dos lineas listas para pegar en `.env.local`. El script dice la
fecha de vencimiento: antes de esa fecha hay que volver a correrlo y actualizar
`AUTH_APPLE_SECRET` en Vercel, o el boton de Apple deja de funcionar.

**Dos advertencias de Apple:**

- Apple **no acepta `localhost`** como Return URL. El boton de Apple solo
  funciona en el dominio publicado; en desarrollo use Google.
- Si la persona elige **Ocultar mi correo**, Apple entrega un alias de
  retransmision en vez de su correo real. Sirve para identificarla, pero si ese
  correo esta en `ADMIN_EMAILS` no coincidira. Para las cuentas de
  administrador, entre con Google.

Guarde el `.p8` en un lugar seguro: lo va a necesitar cada vez que renueve el
secreto, y Apple no lo deja volver a descargar.

### 5. Crear las tablas y la carga inicial

```bash
cd ~/Desktop/carnet-miopia-mml
npm run db:push
npm run db:seed
```

`db:push` crea las tablas en Neon. `db:seed` carga la organizacion y las
plantillas de calendario de control (Consejo Mundial de Optometria y el
protocolo de orto-k de PROLENS). Se puede correr varias veces sin duplicar.

### 6. Correr en el computador

```bash
cd ~/Desktop/carnet-miopia-mml
npm run dev
```

Abra <http://localhost:3000>. Entre con el correo que puso en `ADMIN_EMAILS`:
esa cuenta queda aprobada y como administradora desde el primer ingreso.

### 7. Desplegar en Vercel

```bash
cd ~/Desktop/carnet-miopia-mml
npx vercel link
npx vercel env add DATABASE_URL production
npx vercel env add AUTH_SECRET production
npx vercel env add AUTH_GOOGLE_ID production
npx vercel env add AUTH_GOOGLE_SECRET production
npx vercel env add AUTH_URL production
npx vercel env add ADMIN_EMAILS production
npx vercel env add AUTH_APPLE_ID production
npx vercel env add AUTH_APPLE_SECRET production
npx vercel --prod
```

### 8. Dominio `seguimiento.miopialatam.org`

En el panel de Vercel: **Project → Settings → Domains → Add** y escriba
`seguimiento.miopialatam.org`. Vercel le dara un registro CNAME. En el DNS de
`miopialatam.org` agregue:

| Tipo | Nombre | Valor |
|---|---|---|
| CNAME | `seguimiento` | `cname.vercel-dns.com` |

El dominio raiz y el `www` quedan libres para el sitio del grupo.

## Estructura

```
app/
  (privado)/            todo lo que exige sesion aprobada
    panel/              lista de pacientes con semaforo y adherencia
    pacientes/          ficha, nuevo control, nuevo tratamiento, carnet
    mi-carnet/[id]/     vista de la familia
    admin/aprobaciones/ aprobacion de cuentas
    ajustes/equipos/    equipos de biometria
  ingresar/  pendiente/  page.tsx
components/   ui, marca, graficas, carnet, formularios
config/       umbrales clinicos, tratamientos, calendarios, sitio
lib/
  clinica/    edad, refraccion, crecimiento, adherencia, calendario
  db/         esquema Drizzle y migraciones
  auth/       sesion y permisos
  auditoria/  bitacora
referencia/   carnet de papel, post de Substack, logo
```

## Donde viven los umbrales

Todo valor clinico esta en `config/umbrales-clinicos.ts` con su fuente citada:
el semaforo de crecimiento (Myopia Profile / Gifford), la meta de 26 mm
(Tideman 2016) y la ventana de comparacion a 12 meses. **Ningun umbral esta
quemado en el codigo.**

Los percentiles estan deliberadamente desactivados
(`PERCENTILES_DISPONIBLES = false`) hasta que exista una tabla verificada con su
fuente.

## Privacidad

- Consentimiento informado obligatorio al crear un paciente, con version y fecha
  (Ley 1581 de 2012, Decreto 1377 de 2013).
- Bitacora de auditoria de cada creacion, modificacion, consulta y exportacion.
- Acceso por paciente, con vencimiento y revocable.
- Secretos solo en variables de entorno.
