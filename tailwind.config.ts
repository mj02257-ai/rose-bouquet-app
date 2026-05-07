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
        sans: ['var(--font-space)', 'var(--font-noto-kr)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        canvas: '#0A0A09',
        silver: '#F2F2F0',
      },
      letterSpacing: {
        editorial: '0.06em',
        wide2: '0.08em',
      },
    },
  },
  plugins: [],
};

export default config;
