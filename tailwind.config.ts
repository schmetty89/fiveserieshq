import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        navy: '#0f0f0f',
        accent: '#3a8fff',
        // Generation colors
        e34: { bg: '#FAECE7', text: '#993C1D', border: '#F0997B' },
        e39: { bg: '#E6F1FB', text: '#185FA5', border: '#85B7EB' },
        e60: { bg: '#EEEDFE', text: '#534AB7', border: '#AFA9EC' },
        f10: { bg: '#E1F5EE', text: '#0F6E56', border: '#5DCAA5' },
        g30: { bg: '#FAEEDA', text: '#854F0B', border: '#EF9F27' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
}

export default config
