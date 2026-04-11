/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#7C3AED',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
        accent: {
          DEFAULT: '#C084FC',
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
          800: '#6B21A8',
          900: '#581C87',
        },
        dark: {
          base: '#0F0B1A',
          deeper: '#080511',
          mid: '#1A1030',
          card: '#1E1338',
          border: '#2D1B69',
        },
        lavender: {
          DEFAULT: '#F5F3FF',
          50: '#FDFCFF',
          100: '#F5F3FF',
          200: '#EDE9FE',
          300: '#DDD6FE',
        },
        pink: {
          soft: '#F9A8D4',
          DEFAULT: '#EC4899',
          glow: '#F472B6',
        },
        indigo: {
          soft: '#A5B4FC',
          DEFAULT: '#6366F1',
          deep: '#4338CA',
        },
        gold: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
        },
        success: { DEFAULT: '#10B981', light: '#D1FAE5' },
        warning: { DEFAULT: '#F59E0B', light: '#FEF3C7' },
        error: { DEFAULT: '#EF4444', light: '#FEE2E2' },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.7s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124,58,237,0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(124,58,237,0.7)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'purple-sm': '0 2px 8px rgba(124,58,237,0.25)',
        'purple-md': '0 4px 20px rgba(124,58,237,0.35)',
        'purple-lg': '0 8px 40px rgba(124,58,237,0.45)',
        'purple-xl': '0 16px 60px rgba(124,58,237,0.5)',
        'glow-sm': '0 0 12px rgba(124,58,237,0.5)',
        'glow-md': '0 0 24px rgba(124,58,237,0.6)',
      },
    },
  },
  plugins: [],
};
