import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.toString().replace(/\/$/, '') || 'https://www.cncvela.it';
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const fullUrl = `${siteUrl}${base}`;
  
  const robotsTxt = `# Robots.txt for CNC Caldè
User-agent: *
Allow: /

# Sitemap
Sitemap: ${fullUrl}/sitemap.xml
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};


