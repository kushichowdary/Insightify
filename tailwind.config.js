/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': 'var(--color-brand-primary, #f038d1)',
        'brand-primary-hover': 'var(--color-brand-primary-hover, #f76de0)',
        'brand-accent': 'var(--color-brand-primary, #f038d1)',
        'brand-accent-hover': 'var(--color-brand-primary-hover, #f76de0)',
        
        // Light theme
        'light-background': '#f8fafc', // slate-50
        'light-surface': '#ffffff',
        'light-text': '#0f172a', // slate-900
        'light-text-secondary': '#64748b', // slate-500
        'light-border': '#e2e8f0', // slate-200

        // Dark theme (using brand aliases)
        'dark-background': '#000000',
        'dark-surface': 'rgba(15, 23, 42, 0.4)', // slate-900/40
        'dark-text': '#e2e8f0', // slate-200
        'dark-text-secondary': '#94a3b8', // slate-400
        'dark-border': 'rgba(255, 255, 255, 0.1)',
        
        'magenta': {
          100: '#fee2f8',
          200: '#fec8f2',
          300: '#fa9fe8',
          400: '#f76de0',
          500: '#f038d1',
        },

        // Shared
        'brand-error': '#ef4444',
        'brand-success': '#22c55e',
        'brand-warning': '#f59e0b',
      },
      boxShadow: {
        'glow-magenta': '0 0 30px rgba(240, 56, 209, 0.4), 0 0 15px rgba(240, 56, 209, 0.2)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.5)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',
        'glow-yellow': '0 0 20px rgba(245, 158, 11, 0.5)',
      },
      keyframes: {
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
         'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
         'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
      }
    }
  },
  plugins: [],
}
