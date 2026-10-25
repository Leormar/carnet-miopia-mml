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
    },
  },
  plugins: [],
}

export default config
