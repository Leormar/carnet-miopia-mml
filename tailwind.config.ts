import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Identidad Grupo Manejo Miopia Latam
        crema: '#faf8f3',
        tinta: '#111c26',
        grisTexto: '#5b6570',
        grisMedio: '#3d4955',
        borde: '#ddd6c8',
        magenta: '#e2104f',
        azul: '#1fa3dd',
        amarillo: '#f5c400',
        verde: '#5a9a3a',
        // Fondos suaves del semaforo, tomados del carnet de papel
        semVerde: '#e6f2df',
        semAmarillo: '#fdf3c4',
        semRojo: '#fbe3ea',
      },
      fontFamily: {
        titulo: ['var(--fuente-titulo)', 'Georgia', 'serif'],
        texto: ['var(--fuente-texto)', 'system-ui', 'sans-serif'],
      },
      borderRadius: { mml: '8px' },
      boxShadow: {
        // Sombras calidas: nacen de la tinta, no de un negro puro, para que no
        // ensucien el fondo crema.
        tarjeta: '0 1px 2px rgba(17,28,38,0.04), 0 2px 8px rgba(17,28,38,0.05)',
        elevada: '0 2px 4px rgba(17,28,38,0.05), 0 8px 24px rgba(17,28,38,0.08)',
        boton: '0 1px 2px rgba(17,28,38,0.12), 0 2px 6px rgba(17,28,38,0.12)',
        barra: '0 -1px 0 rgba(17,28,38,0.06), 0 -8px 24px rgba(17,28,38,0.05)',
      },
    },
  },
  plugins: [],
}

export default config
