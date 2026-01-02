import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, cookies }) => {
  const testCookieName = 'test-cookie-vercel';
  const existingCookie = cookies.get(testCookieName);
  
  const now = Date.now();
  
  // Set a test cookie
  cookies.set(testCookieName, `set-at-${now}`, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 5, // 5 minutes
  });

  // Also try setting one similar to what Keystatic might use
  cookies.set('keystatic-test-state', `state-${now}`, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 10,
  });

  const result = {
    timestamp: new Date().toISOString(),
    existingTestCookie: existingCookie?.value || 'NOT FOUND (first visit or cookies blocked)',
    newCookieSet: `set-at-${now}`,
    instructions: [
      '1. Visit this page',
      '2. Check if you see "NOT FOUND" above',
      '3. Refresh the page',
      '4. If cookies work, you should see the previous timestamp in existingTestCookie',
      '5. If still "NOT FOUND", cookies are being blocked or not persisted',
    ],
    browserCheck: 'Open DevTools → Network → click on this request → check Response Headers for Set-Cookie',
    host: request.headers.get('host'),
    secure: request.headers.get('x-forwarded-proto') === 'https',
  };

  return new Response(JSON.stringify(result, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const prerender = false;

