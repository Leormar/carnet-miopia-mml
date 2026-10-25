import type { Metadata, Viewport } from 'next'
import '@fontsource/fraunces/600.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import './globals.css'

import { SITIO } from '@/config/sitio'

export const metadata: Metadata = {
  metadataBase: new URL(SITIO.url),
  title: {
    default: `${SITIO.nombre} · ${SITIO.organizacion}`,
    template: `%s · ${SITIO.nombreCorto}`,
  },
  description:
    'Carnet y seguimiento del tratamiento para desacelerar la miopia en ninos. Uso real del dispositivo junto al crecimiento del ojo.',
  icons: { icon: '/logo.png' },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#faf8f3',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body className="min-h-screen bg-crema text-tinta antialiased">{children}</body>
    </html>
  )
}
