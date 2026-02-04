import crypto from 'node:crypto';
import { getEnv } from '../_lib/auth.js';

export default async function handler(req, res) {
  const clientId = getEnv('GITHUB_CLIENT_ID');
  if (!clientId) return res.status(500).send('Missing GITHUB_CLIENT_ID');

  const baseUrl = getEnv('PUBLIC_BASE_URL', 'https://urualabs.com');
  const redirectUri = `${baseUrl}/api/auth/callback`;

  const state = crypto.randomBytes(16).toString('hex');
  // Non-persistent state (minimal). For stronger CSRF, store in a short-lived cookie.
  res.setHeader('Set-Cookie', `oauth_state=${state}; Path=/; Max-Age=300; HttpOnly; SameSite=Lax; Secure`);

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', 'read:user');
  url.searchParams.set('state', state);

  res.status(302).setHeader('Location', url.toString());
  res.end();
}
