
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#11151B',
        surface: '#191F28',
        'surface-light': '#202833',
        wine: {
          900: '#24151B',
          800: '#321923',
          700: '#48202B',
          600: '#682735',
          500: '#8A3042',
          400: '#A83A4D',
          300: '#C45A69',
        },
        bone: '#E5E9EF',
        mute: '#929BA8',
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', 'Impact', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
