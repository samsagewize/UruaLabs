import { getEnv, parseCookies, setCookie, signToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  const clientId = getEnv('GITHUB_CLIENT_ID');
  const clientSecret = getEnv('GITHUB_CLIENT_SECRET');
  const ownerLogin = getEnv('OWNER_GITHUB_LOGIN', 'samsagewize');
  const sessionSecret = getEnv('SESSION_SECRET');
  const baseUrl = getEnv('PUBLIC_BASE_URL', 'https://urualabs.com');

  if (!clientId || !clientSecret) return res.status(500).send('Missing GitHub OAuth env');
  if (!sessionSecret) return res.status(500).send('Missing SESSION_SECRET');

  const { code, state } = req.query || {};
  if (!code) return res.status(400).send('Missing code');

  const cookies = parseCookies(req);
  if (!state || cookies.oauth_state !== state) {
    return res.status(400).send('Invalid state');
  }

  // Exchange code for access token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  const tokenJson = await tokenRes.json();
  const accessToken = tokenJson.access_token;
  if (!accessToken) {
    return res.status(401).send('OAuth failed');
  }

  // Fetch user
  const userRes = await fetch('https://api.github.com/user', {
    headers: {
      'accept': 'application/vnd.github+json',
      'authorization': `Bearer ${accessToken}`,
      'user-agent': 'urualabs-pingwin',
    },
  });

  const user = await userRes.json();
  const login = String(user?.login || '');
  const id = user?.id;

  if (login.toLowerCase() !== ownerLogin.toLowerCase()) {
    return res.status(403).send('Not authorized');
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: `github:${id}`,
    login,
    iat: now,
    exp: now + 60 * 60 * 24 * 7, // 7 days
  };

  const token = signToken(payload, sessionSecret);
  setCookie(res, { name: 'pingwin_session', value: token, maxAgeSeconds: 60 * 60 * 24 * 7 });

  // Clear oauth_state cookie
  res.setHeader('Set-Cookie', [
    `oauth_state=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure`,
    `pingwin_session=${encodeURIComponent(token)}; Path=/; Max-Age=${60 * 60 * 24 * 7}; HttpOnly; SameSite=Lax; Secure`,
  ]);

  res.status(302).setHeader('Location', `${baseUrl}/#pingwin-chat`);
  res.end();
}
