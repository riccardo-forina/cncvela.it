import type { APIRoute } from 'astro';

const pages = [
  { path: '', changefreq: 'weekly', priority: '1.0', lastmod: '2025-12-27' },
  { path: 'corsi', changefreq: 'monthly', priority: '0.9', lastmod: '2025-12-27' },
  { path: 'regate', changefreq: 'weekly', priority: '0.9', lastmod: '2025-12-27' },
  { path: 'bacheca', changefreq: 'weekly', priority: '0.8', lastmod: '2025-12-27' },
  { path: 'galleria', changefreq: 'monthly', priority: '0.8', lastmod: '2025-12-27' },
  { path: 'circolo', changefreq: 'monthly', priority: '0.8', lastmod: '2025-12-27' },
  { path: 'meteo', changefreq: 'daily', priority: '0.7', lastmod: '2025-12-27' },
  { path: 'safeguarding', changefreq: 'yearly', priority: '0.5', lastmod: '2025-12-27' },
  { path: 'privacy', changefreq: 'yearly', priority: '0.3', lastmod: '2025-12-27' },
];

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.toString().replace(/\/$/, '') || 'https://www.cncvela.it';
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const fullUrl = `${siteUrl}${base}`;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${fullUrl}${page.path ? `/${page.path}` : ''}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};

