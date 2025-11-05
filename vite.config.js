import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // When publishing to GitHub Pages for a repo page, set `base` to
  // '/<repo-name>/' so asset URLs resolve correctly. We also output
  // the build into `docs/` so GitHub Pages can serve from the main/docs
  // folder without extra deployment tooling.
  base: '/hyrule-api/',
  plugins: [react()],
  build: {
    outDir: 'docs'
  }
})
