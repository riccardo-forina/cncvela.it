import type { APIRoute } from 'astro';

interface OAuthTestResult {
  status?: number;
  hasAccessToken?: boolean;
  hasError?: boolean;
  error?: string;
  errorDescription?: string;
  errorUri?: string;
  tokenType?: string;
  scope?: string;
  note?: string;
  user?: {
    login: string;
    id: number;
    type: string;
  };
  repoAccess?: {
    status: number;
    canAccess: boolean;
    permissions: unknown;
  };
}

interface DebugResults {
  timestamp: string;
  environment: Record<string, unknown>;
  request: Record<string, unknown>;
  githubTest: Record<string, unknown>;
  keystatic: Record<string, unknown>;
  oauthTest?: OAuthTestResult;
  issues?: string[];
}

export const GET: APIRoute = async ({ request, url }) => {
  const results: DebugResults = {
    timestamp: new Date().toISOString(),
    environment: {},
    request: {},
    githubTest: {},
    keystatic: {},
  };

  // 1. Environment variables check
  const clientId = import.meta.env.KEYSTATIC_GITHUB_CLIENT_ID;
  const clientSecret = import.meta.env.KEYSTATIC_GITHUB_CLIENT_SECRET;
  const secret = import.meta.env.KEYSTATIC_SECRET;
  const appSlug = import.meta.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG;

  results.environment = {
    KEYSTATIC_GITHUB_CLIENT_ID: clientId ? `${clientId.substring(0, 4)}...${clientId.substring(clientId.length - 4)} (${clientId.length} chars)` : '❌ NOT SET',
    KEYSTATIC_GITHUB_CLIENT_SECRET: clientSecret ? `${clientSecret.substring(0, 4)}...${clientSecret.substring(clientSecret.length - 4)} (${clientSecret.length} chars)` : '❌ NOT SET',
    KEYSTATIC_SECRET: secret ? `${secret.substring(0, 4)}...${secret.substring(secret.length - 4)} (${secret.length} chars)` : '❌ NOT SET',
    PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: appSlug || '❌ NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: import.meta.env.VERCEL_ENV,
    VERCEL_URL: import.meta.env.VERCEL_URL,
  };

  // 2. Request info
  results.request = {
    url: request.url,
    host: request.headers.get('host'),
    origin: request.headers.get('origin'),
    referer: request.headers.get('referer'),
    'x-forwarded-host': request.headers.get('x-forwarded-host'),
    'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
    cookies: request.headers.get('cookie') ? 'present' : 'none',
  };

  // 3. Keystatic expected URLs
  const expectedCallbackUrl = 'https://www.cncvela.it/api/keystatic/github/oauth/callback';
  results.keystatic = {
    expectedCallbackUrl,
    configuredRepo: 'riccardo-forina/cncvela.it',
    siteUrl: 'https://www.cncvela.it',
  };

  // 4. Test GitHub API (basic connectivity)
  try {
    const ghResponse = await fetch('https://api.github.com/repos/riccardo-forina/cncvela.it', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'cncvela-debug',
      },
    });
    
    results.githubTest = {
      repoAccessible: ghResponse.ok,
      status: ghResponse.status,
      repoData: ghResponse.ok ? await ghResponse.json().then(d => ({
        name: d.name,
        full_name: d.full_name,
        private: d.private,
        default_branch: d.default_branch,
      })) : await ghResponse.text(),
    };
  } catch (error) {
    results.githubTest = {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // 5. Test OAuth token exchange (if code provided)
  const code = url.searchParams.get('code');
  if (code && clientId && clientSecret) {
    try {
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      results.oauthTest = {
        status: tokenResponse.status,
        hasAccessToken: !!tokenData.access_token,
        hasError: !!tokenData.error,
        error: tokenData.error,
        errorDescription: tokenData.error_description,
        errorUri: tokenData.error_uri,
        tokenType: tokenData.token_type,
        scope: tokenData.scope,
      };

      // If we got a token, test it
      if (tokenData.access_token) {
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'cncvela-debug',
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          results.oauthTest.user = {
            login: userData.login,
            id: userData.id,
            type: userData.type,
          };
        }

        // Test repo access with token
        const repoResponse = await fetch('https://api.github.com/repos/riccardo-forina/cncvela.it', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'cncvela-debug',
          },
        });

        results.oauthTest.repoAccess = {
          status: repoResponse.status,
          canAccess: repoResponse.ok,
          permissions: repoResponse.ok ? await repoResponse.json().then(d => d.permissions) : null,
        };
      }
    } catch (error) {
      results.oauthTest = {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  } else if (code) {
    results.oauthTest = {
      note: 'Code provided but missing client credentials',
    };
  } else {
    results.oauthTest = {
      note: 'Add ?code=XXX to test OAuth token exchange (use the code from failed callback)',
    };
  }

  // 6. Check for common issues
  const issues: string[] = [];
  
  if (!clientId) issues.push('Missing KEYSTATIC_GITHUB_CLIENT_ID');
  if (!clientSecret) issues.push('Missing KEYSTATIC_GITHUB_CLIENT_SECRET');
  if (!secret) issues.push('Missing KEYSTATIC_SECRET');
  if (clientId && clientId.includes(' ')) issues.push('KEYSTATIC_GITHUB_CLIENT_ID contains spaces');
  if (clientSecret && clientSecret.includes(' ')) issues.push('KEYSTATIC_GITHUB_CLIENT_SECRET contains spaces');
  if (clientSecret && clientSecret.includes('\n')) issues.push('KEYSTATIC_GITHUB_CLIENT_SECRET contains newlines');
  
  // GitHub OAuth Client IDs are typically 20 characters
  if (clientId && clientId.length !== 20) {
    issues.push(`KEYSTATIC_GITHUB_CLIENT_ID has unusual length (${clientId.length}), OAuth Client IDs are typically 20 chars`);
  }
  
  // GitHub OAuth Client Secrets are typically 40 characters
  if (clientSecret && clientSecret.length !== 40) {
    issues.push(`KEYSTATIC_GITHUB_CLIENT_SECRET has unusual length (${clientSecret.length}), OAuth Secrets are typically 40 chars`);
  }

  results.issues = issues.length > 0 ? issues : ['No obvious issues detected'];

  return new Response(JSON.stringify(results, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const prerender = false;

