import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.toString().replace(/\/$/, '') || 'https://www.cncvela.it';
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const productionUrl = 'https://www.cncvela.it';
  
  // Check if we're on GitHub Pages (staging)
  const isGitHubPages = siteUrl.includes('github.io');
  
  let robotsTxt: string;
  
  if (isGitHubPages) {
    // Staging: block all crawlers
    robotsTxt = `# Robots.txt for CNC Caldè - STAGING ENVIRONMENT
# This is a staging/preview site. Please index the production site instead.

User-agent: *
Disallow: /

# Production site
# https://www.cncvela.it
`;
  } else {
    // Production: allow crawlers
    robotsTxt = `# Robots.txt for CNC Caldè
User-agent: *
Allow: /

# Sitemap
Sitemap: ${productionUrl}/sitemap.xml
`;
  }

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};


