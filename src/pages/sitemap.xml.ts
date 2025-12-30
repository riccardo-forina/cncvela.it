import type { APIRoute } from 'astro';

const pages = [
  { path: '', changefreq: 'weekly', priority: '1.0' },
  { path: 'corsi', changefreq: 'monthly', priority: '0.9' },
  { path: 'regate', changefreq: 'weekly', priority: '0.9' },
  { path: 'bacheca', changefreq: 'weekly', priority: '0.8' },
  { path: 'galleria', changefreq: 'monthly', priority: '0.8' },
  { path: 'circolo', changefreq: 'monthly', priority: '0.8' },
  { path: 'meteo', changefreq: 'daily', priority: '0.7' },
  { path: 'safeguarding', changefreq: 'yearly', priority: '0.5' },
  { path: 'privacy', changefreq: 'yearly', priority: '0.3' },
  { path: 'cookie-policy', changefreq: 'yearly', priority: '0.3' },
];

const locales = ['it', 'en', 'de'] as const;
const defaultLocale = 'it';

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.toString().replace(/\/$/, '') || 'https://www.cncvela.it';
  
  // Use current date for lastmod (YYYY-MM-DD format)
  const lastmod = new Date().toISOString().split('T')[0];

  // Generate URLs for each page in each locale with hreflang alternates
  const urls = pages.flatMap((page) => {
    return locales.map((locale) => {
      const pagePath = page.path ? `/${page.path}` : '';
      const localePath = locale === defaultLocale ? pagePath : `/${locale}${pagePath}`;
      const url = `${siteUrl}${localePath}`;

      // Generate hreflang links for all locales
      const hreflangs = locales.map((altLocale) => {
        const altPath = page.path ? `/${page.path}` : '';
        const altLocalePath = altLocale === defaultLocale ? altPath : `/${altLocale}${altPath}`;
        return `    <xhtml:link rel="alternate" hreflang="${altLocale}" href="${siteUrl}${altLocalePath}" />`;
      }).join('\n');

      // Add x-default pointing to Italian (default locale)
      const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${pagePath}" />`;

      return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
${hreflangs}
${xDefault}
  </url>`;
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
