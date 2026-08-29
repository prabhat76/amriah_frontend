/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#FFFFFF',
        offwhite: '#F7F6F4',
        gray: {
          50:  '#FAFAFA',
          100: '#F5F5F5',
          150: '#EFEFEF',
          200: '#E8E8E8',
          300: '#D0D0D0',
          400: '#A0A0A0',
          500: '#707070',
          600: '#505050',
          700: '#383838',
          800: '#242424',
          900: '#141414',
        },
      },
      fontFamily: {
        display: ['"Anton"', '"Bebas Neue"', '"Impact"', 'Arial Black', 'sans-serif'],
        body: ['"DM Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        xs:   ['0.75rem',  { lineHeight: '1.125rem' }],
        sm:   ['0.875rem', { lineHeight: '1.375rem' }],
        base: ['1rem',     { lineHeight: '1.625rem' }],
        lg:   ['1.125rem', { lineHeight: '1.75rem' }],
        xl:   ['1.25rem',  { lineHeight: '1.875rem' }],
        '2xl': ['1.5rem',  { lineHeight: '2rem' }],
        '3xl': ['1.875rem',{ lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem',    { lineHeight: '3.25rem', letterSpacing: '-0.01em' }],
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        '7xl': ['4.5rem',  { lineHeight: '1', letterSpacing: '-0.02em' }],
        '8xl': ['6rem',    { lineHeight: '1', letterSpacing: '-0.03em' }],
        '9xl': ['8rem',    { lineHeight: '1', letterSpacing: '-0.03em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      maxWidth: {
        content: '1280px',
      },
      borderWidth: {
        DEFAULT: '1px',
      },
    },
  },
  plugins: [],
}
