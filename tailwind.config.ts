import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sojourn: {
          black: '#000000',
          white: '#FFFFFF',
          gray: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#E5E5E5',
            300: '#D4D4D4',
            400: '#A3A3A3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
          },
          accent: '#6B8E9E', // Muted blue-gray accent
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        display: ['Cormorant Garamond', 'serif'],
      },
      fontSize: {
        'hero': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1.1', letterSpacing: '0.02em' }],
        'section': ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.2', letterSpacing: '0.03em' }],
      },
      letterSpacing: {
        'luxury': '0.1em',
        'wider-luxury': '0.15em',
        'widest-luxury': '0.2em',
      },
      boxShadow: {
        'minimal': '0 2px 20px rgba(0, 0, 0, 0.04)',
        'minimal-hover': '0 4px 30px rgba(0, 0, 0, 0.08)',
        'luxury': '0 10px 60px rgba(0, 0, 0, 0.08)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '700': '700ms',
        '800': '800ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'luxury': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      aspectRatio: {
        'cabin': '3 / 2',
        'hero': '16 / 9',
        'amenity': '1 / 1',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        'container': '1400px',
      },
      animation: {
        'fadeIn': 'fadeIn 0.6s ease-out',
        'fadeInUp': 'fadeInUp 0.8s ease-out',
        'slideInLeft': 'slideInLeft 0.6s ease-out',
        'slideInRight': 'slideInRight 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        slideInLeft: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        slideInRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
      },
    },
  },
  plugins: [],
}

export default config