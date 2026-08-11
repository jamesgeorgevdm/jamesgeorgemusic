import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom gives us a fake browser (document, window) for React components
    environment: 'jsdom',
    // Load jest-dom matchers like toBeInTheDocument() before every test file
    setupFiles: './src/test/setup.js',
  },
})
