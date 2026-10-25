import { config } from 'dotenv'
import type { Config } from 'drizzle-kit'

// drizzle-kit corre fuera de Next, asi que hay que cargar el entorno a mano.
config({ path: '.env.local' })

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
} satisfies Config
