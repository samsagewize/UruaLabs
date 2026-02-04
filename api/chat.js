import { getEnv, parseCookies, verifyToken } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const sessionSecret = getEnv('SESSION_SECRET');
  if (!sessionSecret) return res.status(500).json({ error: 'Missing SESSION_SECRET' });

  const cookies = parseCookies(req);
  const token = cookies.pingwin_session;
  const payload = verifyToken(token, sessionSecret);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  const { message } = req.body || {};
  const userMsg = String(message || '').trim();
  if (!userMsg) return res.status(400).json({ error: 'Missing message' });

  // Choose provider:
  // - If NVIDIA_API_KEY present, use NVIDIA NIM (OpenAI-compatible)
  // - Else use OpenAI if OPENAI_API_KEY present
  const nvidiaKey = getEnv('NVIDIA_API_KEY');
  const openaiKey = getEnv('OPENAI_API_KEY');

  const system = `You are PingWin, the soul of Urua Labs.\n\nUrua Labs sells: website development, AI programming/automation, NFT creation, smart contract deployment, and PingWin installs (OpenClaw assistant setup).\n\nAlways keep answers concise, actionable, and point to urualabs@gmail.com for contact and quotes. If asked about pricing, say pricing is by project and suggest using the quote buttons.\n\nIf asked about blockchain portfolio: Bitcoin Ordinals collections (Ordinookis, Rare78) and the Solana PingWin token on bags.fm.`;

  let baseUrl, apiKey, model;
  if (nvidiaKey) {
    baseUrl = getEnv('NVIDIA_NIM_BASE_URL', 'https://integrate.api.nvidia.com');
    apiKey = nvidiaKey;
    model = getEnv('NVIDIA_NIM_MODEL', 'moonshotai/kimi-k2.5');
  } else if (openaiKey) {
    baseUrl = 'https://api.openai.com';
    apiKey = openaiKey;
    model = getEnv('OPENAI_MODEL', 'gpt-4o-mini');
  } else {
    return res.status(500).json({ error: 'No model API key configured (set NVIDIA_API_KEY or OPENAI_API_KEY)' });
  }

  const resp = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMsg },
      ],
      temperature: 0.4,
      max_tokens: 600,
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    return res.status(500).json({ error: 'Model error', detail: txt });
  }

  const json = await resp.json();
  const out = json.choices?.[0]?.message?.content ?? '';
  return res.status(200).json({ reply: out, user: payload.login });
}
