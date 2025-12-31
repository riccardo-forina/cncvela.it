// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';

const isVercelProduction = process.env.VERCEL_ENV === 'production';

// In produzione: dominio finale (www.cncvela.it)
// In preview/staging: URL Vercel dinamico (per SEO canonical)
// In locale: localhost
export default defineConfig({
  site: isVercelProduction 
    ? 'https://www.cncvela.it' 
    : process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:4321',
  base: '/',
  
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
    plugins: [tailwindcss()],
  }
});
