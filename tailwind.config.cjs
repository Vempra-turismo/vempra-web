/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#0077b6', // Azul Vibrante
        'primary-dark': '#005f9e',
        secondary: '#f9a825', // Amarillo Dorado
        'secondary-dark': '#f59e0b',
        'text-main': '#333333',
        'background-light': '#f7f7fa',
        'background-white': '#FFFFFF',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};