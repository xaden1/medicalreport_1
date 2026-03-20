/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soft Peach and Pink Theme (keeping old keys to avoid refactoring)
        'dark': {
          'bg': '#FDF3F1',      // Main background (Soft Peach)
          'panel': '#FFFFFF',   // Card/panel background
          'border': '#F5D6D3',  // Border color (Light pinkish)
          'hover': '#FCE5E1',   // Hover state (Darker peach)
        },
        'text': {
          'primary': '#6D4C41', // Primary text (Warm dark brown)
          'secondary': '#A07A76',// Secondary text (Muted brown)
          'muted': '#D4B8B4',   // Muted text
        },
        'accent': {
          'gold': '#E67E8D',    // Main Accent (Retro pink/red)
          'bronze': '#D96C7A',  // Secondary Accent (Darker pink)
          'sage': '#F7C8C2',    // Tertiary Accent (Light pink)
        },
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
        'jetbrains': ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.2)',
        'elevated': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'inner-soft': 'inset 0 1px 3px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        'lg': '8px',
        'md': '6px',
        'sm': '4px',
      },
      opacity: {
        '85': '0.85',
        '75': '0.75',
      },
    },
  },
  plugins: [],
}
