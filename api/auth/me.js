import { getEnv, parseCookies, verifyToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  const sessionSecret = getEnv('SESSION_SECRET');
  if (!sessionSecret) return res.status(500).json({ error: 'Missing SESSION_SECRET' });

  const cookies = parseCookies(req);
  const token = cookies.pingwin_session;
  const payload = verifyToken(token, sessionSecret);

  if (!payload) return res.status(200).json({ authed: false });
  return res.status(200).json({ authed: true, login: payload.login, exp: payload.exp });
}
