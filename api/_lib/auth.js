import crypto from 'node:crypto';

const b64u = {
  enc: (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''),
  dec: (s) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64'),
};

export function getEnv(name, fallback = null) {
  const v = process.env[name];
  return (v && String(v).trim()) ? v : fallback;
}

export function signToken(payloadObj, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = b64u.enc(JSON.stringify(header));
  const payloadB64 = b64u.enc(JSON.stringify(payloadObj));
  const data = `${headerB64}.${payloadB64}`;
  const sig = crypto.createHmac('sha256', secret).update(data).digest();
  return `${data}.${b64u.enc(sig)}`;
}

export function verifyToken(token, secret) {
  const parts = (token || '').split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const data = `${h}.${p}`;
  const expected = crypto.createHmac('sha256', secret).update(data).digest();
  const got = b64u.dec(s);
  // constant-time compare
  if (got.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(got, expected)) return null;
  try {
    return JSON.parse(b64u.dec(p).toString('utf8'));
  } catch {
    return null;
  }
}

export function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  header.split(';').map(v => v.trim()).filter(Boolean).forEach(kv => {
    const i = kv.indexOf('=');
    if (i === -1) return;
    out[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1));
  });
  return out;
}

export function setCookie(res, { name, value, maxAgeSeconds }) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Secure',
  ];
  if (typeof maxAgeSeconds === 'number') {
    parts.push(`Max-Age=${maxAgeSeconds}`);
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearCookie(res, name) {
  res.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure`);
}
