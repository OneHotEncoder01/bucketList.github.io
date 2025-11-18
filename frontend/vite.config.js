import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Use a relative base so the built site works regardless of Pages path
  base: './',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
  plugins: [react()],
})
