/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        status: {
          open:          '#EF4444', // red-500
          investigating: '#F59E0B', // amber-500
          resolved:      '#10B981', // emerald-500
        },
        priority: {
          low:      '#6B7280', // gray-500
          medium:   '#3B82F6', // blue-500
          high:     '#F59E0B', // amber-500
          critical: '#EF4444', // red-500
        },
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Stat number flip — subtle scale pulse when a count changes
        countPop: {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        pulseOnce: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.5' },
        },
      },
      animation: {
        fadeIn:    'fadeIn 0.25s ease-out both',
        slideUp:   'slideUp 0.3s ease-out both',
        countPop:  'countPop 0.35s ease-out both',
        pulseOnce: 'pulseOnce 0.6s ease-in-out',
      },
    },
  },
  plugins: [],
};