// Tailwind CSS Configuration (tailwind.config.js)
// Tailwind configuration file for customizing styles
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}', // Specifying where Tailwind should look for class names
    './components/**/*.{js,ts,jsx,tsx}', // Includes all components for Tailwind to process
  ],
  theme: {
    extend: {
      colors: {
        hero: '#C41E3A', // Custom hero color used across the site
        blue: '#002F87', // St. Louis Blues blue color
        gold: '#FDB927', // St. Louis gold color
      },
      fontFamily: {
        oswald: ['Oswald', 'sans-serif'], // Oswald font for titles
        montserrat: ['Montserrat', 'sans-serif'], // Montserrat font for other text
      },
    },
  },
  plugins: [], // No additional Tailwind plugins used in this project
};