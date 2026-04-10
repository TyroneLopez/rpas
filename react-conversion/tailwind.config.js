/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        gold: {
          DEFAULT: '#f5c200',
          light: '#fef3c7',
          dark: '#d4a800',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde58a',
          300: '#fcd24d',
          400: '#f5c200',
          500: '#e6ad00',
          600: '#d4a800',
          700: '#b88d00',
          800: '#946f00',
          900: '#7a5c00',
        },
        green: {
          brand: '#1a6b30',
          light: '#e8f5ed',
          dark: '#145525',
          50: '#f0fdf4',
          100: '#e8f5ed',
          200: '#c1e6cd',
          300: '#8dd1a8',
          400: '#52b37d',
          500: '#1a6b30',
          600: '#145525',
          700: '#10441e',
          800: '#0c3316',
          900: '#08220f',
        },
        // Status colors
        status: {
          submitted: '#6B7280',
          under_review: '#F59E0B',
          in_progress: '#3B82F6',
          for_revision: '#EF4444',
          completed: '#1A6B30',
          cancelled: '#9CA3AF',
          resubmitted: '#7C3AED',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        'alder': '0 8px 24px rgba(0, 0, 0, 0.4)',
        'chat': '0 16px 60px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        'card': '12px',
        'card-sm': '8px',
        'card-lg': '16px',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2.5s ease-in-out infinite',
        'pop-in': 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'msg-in': 'msgIn 0.3s ease',
        'typing': 'typing 1.2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGold: {
          '0%': { boxShadow: '0 6px 24px rgba(26, 107, 48, 0.5), 0 0 0 0 rgba(245, 194, 0, 0.4)' },
          '50%': { boxShadow: '0 6px 24px rgba(26, 107, 48, 0.5), 0 0 0 12px rgba(245, 194, 0, 0)' },
          '100%': { boxShadow: '0 6px 24px rgba(26, 107, 48, 0.5), 0 0 0 0 rgba(245, 194, 0, 0)' },
        },
        popIn: {
          from: { opacity: '0', transform: 'scale(0.5)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        msgIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        typing: {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%': { transform: 'translateY(-6px)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}