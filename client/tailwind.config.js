/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    'node_modules/flowbite-react/lib/esm/**/*.js',
  ],
  theme: {
    extend: {
      borderWidth: {
        1: "1px",
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

