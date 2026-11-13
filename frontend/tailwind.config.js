/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#F4F7F2',
          100: '#E6EEE2',
          200: '#CDDCF6',
          300: '#AEC69F',
          400: '#8AA977',
          500: '#678B50',
          600: '#52753C',
          700: '#415D30',
          800: '#324825',
          900: '#23331A',
        },
        gold: {
          400: '#E5C058',
          500: '#D4AF37',
          600: '#B8860B',
        },
        canvas: {
          DEFAULT: '#F7F9F6',
          secondary: '#EDF2EB',
        }
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(82, 117, 60, 0.08)',
        'soft-hover': '0 12px 30px -4px rgba(82, 117, 60, 0.16)',
      }
    },
  },
  plugins: [],
}
