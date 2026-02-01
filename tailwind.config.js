/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        surface: 'var(--surface)',
        background: 'var(--background)',
        header: 'var(--header)',
        foreground: 'var(--foreground)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        price: 'var(--price)',
        offer: 'var(--offer)'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.18)'
      }
    },
  },
  plugins: [],
}

