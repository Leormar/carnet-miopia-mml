import { signIn } from '@/auth'

function IconoGoogle({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8h-4v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.1 7.1 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8Z" />
    </svg>
  )
}

/** Boton de ingreso con Google, usable desde cualquier pagina de servidor. */
export function BotonGoogle({
  texto = 'Ingresar con Google',
  className = '',
  grande = false,
}: {
  texto?: string
  className?: string
  grande?: boolean
}) {
  return (
    <form
      action={async () => {
        'use server'
        await signIn('google', { redirectTo: '/panel' })
      }}
      className={className}
    >
      <button
        type="submit"
        className={`inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-borde bg-white font-semibold text-tinta shadow-[0_2px_8px_rgba(17,28,38,0.08)] transition hover:border-azul hover:shadow-[0_4px_16px_rgba(31,163,221,0.18)] sm:w-auto ${
          grande ? 'px-7 py-4 text-lg' : 'px-5 py-3 text-base'
        }`}
      >
        <IconoGoogle className={grande ? 'h-6 w-6' : 'h-5 w-5'} />
        {texto}
      </button>
    </form>
  )
}

export { IconoGoogle }
