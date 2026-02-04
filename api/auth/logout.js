import { clearCookie } from '../_lib/auth.js';

export default async function handler(req, res) {
  clearCookie(res, 'pingwin_session');
  res.status(200).json({ ok: true });
}
