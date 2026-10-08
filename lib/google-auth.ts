import { env } from 'cloudflare:workers';
import { cookies } from 'next/headers';
import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose';
import { adminEmail } from './store';

export const SESSION_COOKIE = 'linha_admin';
export const NONCE_COOKIE = 'linha_google_nonce';
export const SESSION_SECONDS = 8 * 60 * 60;
const issuer = 'linha-motors';
const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export function googleClientId() {
  return ((env as unknown as Record<string, string>).GOOGLE_CLIENT_ID || '').trim();
}

function sessionKey() {
  const secret = (env as unknown as Record<string, string>).SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('Authentication is not configured');
  return new TextEncoder().encode(secret);
}

export function googleConfigured() {
  try {
    sessionKey();
    return !!adminEmail() && /^[\w-]+\.apps\.googleusercontent\.com$/.test(googleClientId());
  } catch {
    return false;
  }
}

export async function signChallenge(nonce: string) {
  return new SignJWT({ nonce }).setProtectedHeader({ alg: 'HS256' })
    .setIssuer(issuer).setAudience('google-login').setIssuedAt()
    .setExpirationTime('5m').sign(sessionKey());
}

export async function verifyChallenge(token: string) {
  const { payload } = await jwtVerify(token, sessionKey(), {
    algorithms: ['HS256'], issuer, audience: 'google-login', requiredClaims: ['exp', 'iat', 'nonce'],
  });
  if (typeof payload.nonce !== 'string') throw new Error('Invalid login challenge');
  return payload.nonce;
}

export async function verifyGoogleCredential(credential: string, nonce: string) {
  const { payload } = await jwtVerify(credential, googleKeys, {
    algorithms: ['RS256'],
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: googleClientId(),
    requiredClaims: ['exp', 'iat', 'sub', 'email', 'email_verified', 'nonce'],
  });
  if (payload.nonce !== nonce || payload.email_verified !== true ||
      typeof payload.email !== 'string' || !payload.sub) {
    throw new Error('Invalid Google identity');
  }
  return { email: payload.email.toLowerCase(), userId: payload.sub };
}

export async function signSession(user: { email: string; userId: string }) {
  return new SignJWT({ email: user.email }).setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.userId).setIssuer(issuer).setAudience('admin')
    .setIssuedAt().setExpirationTime(`${SESSION_SECONDS}s`).sign(sessionKey());
}

export async function getAdminUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 4096) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), {
      algorithms: ['HS256'], issuer, audience: 'admin', requiredClaims: ['exp', 'iat', 'sub', 'email'],
    });
    if (typeof payload.email !== 'string' || !adminEmail() ||
        payload.email.toLowerCase() !== adminEmail()) return null;
    return { email: payload.email, userId: payload.sub! };
  } catch {
    return null;
  }
}

export function cookieHeader(name: string, value: string, request: Request, maxAge: number) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

export function sameOrigin(request: Request) {
  return request.headers.get('origin') === new URL(request.url).origin;
}
