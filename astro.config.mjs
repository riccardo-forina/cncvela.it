// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// ============================================
// SITE CONFIGURATION
// ============================================
// For GitHub Pages (demo):
//   site: 'https://riccardo-forina.github.io'
//   base: '/cncvela.it'
//
// For production (cncvela.it):
//   site: 'https://www.cncvela.it'
//   base: '/'
// ============================================

const isProduction = false; // Set to true when deploying to cncvela.it

export default defineConfig({
  site: isProduction ? 'https://www.cncvela.it' : 'https://riccardo-forina.github.io',
  base: isProduction ? '/' : '/cncvela.it',
  vite: {
    plugins: [tailwindcss()]
  }
});