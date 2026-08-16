import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Builds the marketing landing page into the repo root as index.html +
// landing-assets/. app.html (the working POS demo) is untouched.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    outDir: path.resolve(__dirname, '..'),
    emptyOutDir: false,
    assetsDir: 'landing-assets',
  },
})
