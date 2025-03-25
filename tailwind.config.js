/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF5757', // 鲜艳的红色
        secondary: '#FFF133', // 明亮的黄色
        accent: '#4DAAFC', // 亮蓝色
        dark: '#121212',
        light: '#FFFFFF',
      },
      boxShadow: {
        'brutal': '5px 5px 0 0 rgba(0, 0, 0, 1)',
        'brutal-lg': '8px 8px 0 0 rgba(0, 0, 0, 1)',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
} 