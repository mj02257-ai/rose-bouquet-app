import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#F0EDE8',
        'warm-gray': '#8A8680',
        accent: '#C8A882',
        surface: '#111111',
        'surface-raised': '#161616',
      },
    },
  },
  plugins: [],
};

export default config;
