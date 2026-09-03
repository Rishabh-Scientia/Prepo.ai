/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eef6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#4a8fd4',
          600: '#2e73b8',
          700: '#1e5a9e',
          800: '#1a4a7f',
          900: '#143a63',
        },
        surface: {
          50:  '#ffffff',
          100: '#f7f8fa',
          200: '#ebedf0',
          300: '#d1d5db',
          400: '#9ca3af',
        },
        success: '#16a34a',
        danger:  '#dc2626',
        warn:    '#f59e0b',
      },
      borderRadius: {
        'card': '6px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
