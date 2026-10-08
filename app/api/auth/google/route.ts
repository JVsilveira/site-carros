import { cookies } from 'next/headers';
import { adminEmail } from '@/lib/store';
import {
  googleConfigured, googleClientId, signChallenge, verifyChallenge, verifyGoogleCredential,
  signSession, cookieHeader, sameOrigin, NONCE_COOKIE, SESSION_COOKIE, SESSION_SECONDS,
} from '@/lib/google-auth';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' };

export async function GET(request: Request) {
  if (!googleConfigured()) {
    return Response.json({ error: 'O acesso administrativo está aguardando configuração.' }, { status: 503, headers });
  }
  const nonce = crypto.randomUUID();
  const challenge = await signChallenge(nonce);
  const response = Response.json({ clientId: googleClientId(), nonce }, { headers });
  response.headers.append('Set-Cookie', cookieHeader(NONCE_COOKIE, challenge, request, 300));
  return response;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origem não autorizada.' }, { status: 403, headers });
  if (!googleConfigured()) return Response.json({ error: 'O acesso administrativo está aguardando configuração.' }, { status: 503, headers });
  if (Number(request.headers.get('content-length') || 0) > 16384) {
    return Response.json({ error: 'Resposta de login inválida.' }, { status: 413, headers });
  }
  let credential: string;
  try {
    const raw = await request.text();
    if (raw.length > 16384) return Response.json({ error: 'Resposta de login inválida.' }, { status: 413, headers });
    const body: unknown = JSON.parse(raw);
    if (!body || typeof body !== 'object' || !('credential' in body) ||
        typeof body.credential !== 'string' || body.credential.length > 12000) {
      return Response.json({ error: 'Resposta de login inválida.' }, { status: 400, headers });
    }
    credential = body.credential;
  } catch {
    return Response.json({ error: 'Resposta de login inválida.' }, { status: 400, headers });
  }
  try {
    const challenge = (await cookies()).get(NONCE_COOKIE)?.value;
    if (!challenge) return Response.json({ error: 'Sua tentativa de login expirou. Recarregue a página.' }, { status: 401, headers });
    const nonce = await verifyChallenge(challenge);
    const user = await verifyGoogleCredential(credential, nonce);
    if (user.email !== adminEmail()) {
      return Response.json({ error: 'Esta conta Google não tem permissão para administrar a revenda.' }, { status: 403, headers });
    }
    const token = await signSession(user);
    const response = Response.json({ ok: true }, { headers });
    response.headers.append('Set-Cookie', cookieHeader(SESSION_COOKIE, token, request, SESSION_SECONDS));
    response.headers.append('Set-Cookie', cookieHeader(NONCE_COOKIE, '', request, 0));
    return response;
  } catch {
    return Response.json({ error: 'Não foi possível confirmar sua conta Google. Recarregue a página e tente novamente.' }, { status: 401, headers });
  }
}
