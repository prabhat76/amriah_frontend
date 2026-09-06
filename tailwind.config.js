/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ASTRIMI brand palette — quiet luxury
        navy:    '#0A0E1A',         // deep night (primary dark)
        ink:     '#1A1F2E',         // slightly lifted dark
        gold:    '#C9A84C',         // champagne gold accent
        'gold-light': '#E8C97A',    // hover gold
        cream:   '#F5F0E8',         // warm cream background
        pearl:   '#FAF8F4',         // near-white surface
        mist:    '#E8E2D8',         // border / divider
        stone:   '#9B9488',         // muted text
        blush:   '#C4937A',         // warm accent (rare use)
        // neutrals
        white:   '#FFFFFF',
        black:   '#000000',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Cormorant"', 'Georgia', 'serif'],
        body:    ['"Inter"', 'system-ui', 'sans-serif'],
        italic:  ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        xs:    ['0.75rem',  { lineHeight: '1.2rem' }],
        sm:    ['0.875rem', { lineHeight: '1.5rem' }],
        base:  ['1rem',     { lineHeight: '1.7rem' }],
        lg:    ['1.125rem', { lineHeight: '1.8rem' }],
        xl:    ['1.25rem',  { lineHeight: '1.9rem' }],
        '2xl': ['1.5rem',   { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.2rem' }],
        '4xl': ['2.25rem',  { lineHeight: '2.5rem' }],
        '5xl': ['3rem',     { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        '6xl': ['3.75rem',  { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        '7xl': ['4.5rem',   { lineHeight: '1', letterSpacing: '-0.015em' }],
        '8xl': ['6rem',     { lineHeight: '1', letterSpacing: '-0.02em' }],
        '9xl': ['8rem',     { lineHeight: '0.95', letterSpacing: '-0.025em' }],
      },
      maxWidth: {
        content: '1320px',
        narrow:  '760px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      letterSpacing: {
        widest2: '0.25em',
        widest3: '0.35em',
      },
      animation: {
        'fade-up':   'fadeUp 0.7s ease forwards',
        'fade-in':   'fadeIn 0.5s ease forwards',
        shimmer:     'shimmer 2s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
