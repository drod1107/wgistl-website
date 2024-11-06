// tailwind.config.js
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@shadcn/ui/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        // Keeping your existing brand colors
        hero: '#C41E3A',
        blue: '#002F87',
        gold: '#FDB927',
        // Adding semantic colors for better context
        'content-primary': '#1A1A1A',
        'content-secondary': '#4A4A4A',
        'surface': {
          primary: '#FFFFFF',
          secondary: '#F8F9FA',
          tertiary: '#F1F3F5'
        },
        // Adding overlay colors for modals and dropdowns
        overlay: 'rgba(0, 0, 0, 0.4)',
        // Extending your brand colors with variations
        'hero-light': '#E85D74',
        'hero-dark': '#9C1830',
        'blue-light': '#1A4CAD',
        'blue-dark': '#002266',
        'gold-light': '#FECD58',
        'gold-dark': '#D99B0D',
        // System feedback colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      },
      fontFamily: {
        oswald: ['var(--font-oswald)'],
        montserrat: ['var(--font-montserrat)'],
      },
      spacing: {
        // Adding some common layout spacings
        layout: '2.5rem',
        'layout-sm': '1.5rem',
        'layout-lg': '4rem',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        'lg': 'var(--radius)',
        'md': 'calc(var(--radius) - 2px)',
        'sm': 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        // Enhanced shadow system
        'soft': '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        'raised': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        'prominent': '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
      },
      // Adding z-index system
      zIndex: {
        'dropdown': 100,
        'sticky': 200,
        'modal': 300,
        'popover': 400,
        'toast': 500,
      },
      // Adding container constraints
      maxWidth: {
        'content': '1240px',
        'content-sm': '640px',
        'content-md': '768px',
        'content-lg': '1024px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};