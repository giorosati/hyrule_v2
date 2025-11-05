import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // When publishing to GitHub Pages for a repo page, set `base` to
  // '/<repo-name>/' so asset URLs resolve correctly. We also output
  // the build into `docs/` so GitHub Pages can serve from the main/docs
  // folder without extra deployment tooling.
  // NOTE: changed to match the desired site path '/hyrule_v2/'
  base: '/hyrule_v2/',
  plugins: [react()],
  build: {
    outDir: 'docs'
  }
})
