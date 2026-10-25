import NextAuth, { type DefaultSession } from 'next-auth'
import type { Provider } from 'next-auth/providers'
import Google from 'next-auth/providers/google'
import Apple from 'next-auth/providers/apple'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { accounts, auditLog, sessions, users, verificationTokens } from '@/lib/db/schema'

/** Correos que entran ya aprobados y con permiso de administrador. */
function correosAdmin(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * El acceso es cerrado. Google siempre esta disponible; Apple solo se ofrece si
 * estan configuradas sus credenciales, para que la aplicacion no se caiga
 * mientras no exista la cuenta de desarrollador de Apple.
 */
function proveedores(): Provider[] {
  const lista: Provider[] = [
    Google({
      allowDangerousEmailAccountLinking: true,
      authorization: { params: { prompt: 'select_account' } },
    }),
  ]
  if (process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET) {
    lista.push(
      Apple({
        clientId: process.env.AUTH_APPLE_ID,
        clientSecret: process.env.AUTH_APPLE_SECRET,
        allowDangerousEmailAccountLinking: true,
        /**
         * Apple solo manda el nombre la primera vez que la persona autoriza, y
         * lo manda aparte del id_token. Si usa "Ocultar mi correo", el correo
         * que llega es un alias de retransmision de Apple: sirve para
         * identificarla, pero no es su correo real.
         */
        profile(perfil: Record<string, unknown>, tokens: Record<string, unknown>) {
          const nombre =
            typeof tokens.user === 'string'
              ? (() => {
                  try {
                    const u = JSON.parse(tokens.user) as { name?: { firstName?: string; lastName?: string } }
                    return [u.name?.firstName, u.name?.lastName].filter(Boolean).join(' ') || null
                  } catch {
                    return null
                  }
                })()
              : null
          return {
            id: String(perfil.sub),
            name: nombre ?? (perfil.name as string | undefined) ?? null,
            email: (perfil.email as string | undefined) ?? null,
            image: null,
          }
        },
      }),
    )
  }
  return lista
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      status: 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido'
      isAdmin: boolean
    } & DefaultSession['user']
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: proveedores(),
  session: { strategy: 'database', maxAge: 60 * 60 * 24 * 14 },
  pages: { signIn: '/ingresar', error: '/ingresar' },
  callbacks: {
    async session({ session, user }) {
      const fila = await db
        .select({ status: users.status, isAdmin: users.isAdmin })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1)
      session.user.id = user.id
      session.user.status = fila[0]?.status ?? 'pendiente'
      session.user.isAdmin = fila[0]?.isAdmin ?? false
      return session
    },
  },
  events: {
    /**
     * Toda cuenta nueva nace pendiente de aprobacion, salvo los correos
     * declarados en ADMIN_EMAILS, que entran aprobados y como administradores.
     */
    async createUser({ user }) {
      const correo = (user.email ?? '').toLowerCase()
      if (correo && correosAdmin().includes(correo)) {
        await db
          .update(users)
          .set({ status: 'aprobado', isAdmin: true, approvedAt: new Date() })
          .where(eq(users.id, user.id!))
      }
    },
    async signIn({ user }) {
      if (!user.id) return
      await db.insert(auditLog).values({
        actorUserId: user.id,
        action: 'login',
        entity: 'user',
        entityId: user.id,
      })
    },
  },
  trustHost: true,
})
