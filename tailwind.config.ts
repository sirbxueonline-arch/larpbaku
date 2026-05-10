const config = {
  content: ['./app/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Azerbaijani flag colors
        az: {
          blue: '#00B5E2',
          red: '#EF3340',
          green: '#509E2F',
        },
      },
    },
  },
  plugins: [],
}

export default config
