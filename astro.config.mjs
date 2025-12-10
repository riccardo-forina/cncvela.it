// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://riccardo-forina.github.io',
  base: '/cncvela.it',
  vite: {
    plugins: [tailwindcss()]
  }
});