import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const envCheck = {
    hasClientId: !!import.meta.env.KEYSTATIC_GITHUB_CLIENT_ID,
    hasClientSecret: !!import.meta.env.KEYSTATIC_GITHUB_CLIENT_SECRET,
    hasSecret: !!import.meta.env.KEYSTATIC_SECRET,
    hasAppSlug: !!import.meta.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG,
    clientIdLength: import.meta.env.KEYSTATIC_GITHUB_CLIENT_ID?.length || 0,
    clientSecretLength: import.meta.env.KEYSTATIC_GITHUB_CLIENT_SECRET?.length || 0,
    secretLength: import.meta.env.KEYSTATIC_SECRET?.length || 0,
    appSlug: import.meta.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG || '(not set)',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: import.meta.env.VERCEL_ENV,
    isProd: import.meta.env.PROD,
    isDev: import.meta.env.DEV,
  };

  return new Response(JSON.stringify(envCheck, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const prerender = false;

