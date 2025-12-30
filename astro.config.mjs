// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';

// ============================================
// SITE CONFIGURATION
// ============================================
// Vercel: base = '/', site = cncvela.it or preview URL
// GitHub Pages: base = '/cncvela.it'
// ============================================

const isVercel = !!process.env.VERCEL;
const isVercelProduction = process.env.VERCEL_ENV === 'production';

export default defineConfig({
  site: isVercelProduction 
    ? 'https://www.cncvela.it' 
    : isVercel 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://riccardo-forina.github.io',
  base: isVercel ? '/' : '/cncvela.it',
  
  // Keystatic needs server mode for the admin UI
  // Pages marked with prerender: false will be rendered at runtime
  output: 'server',
  
  adapter: vercel(),
  
  integrations: [
    react(),
    keystatic(),
  ],
  
  // i18n configuration
  i18n: {
    defaultLocale: 'it',
    locales: ['it', 'en', 'de'],
    routing: {
      prefixDefaultLocale: false, // / = italiano, /en/ = inglese, /de/ = tedesco
    }
  },
  
  vite: {
    plugins: [tailwindcss()]
  }
});
