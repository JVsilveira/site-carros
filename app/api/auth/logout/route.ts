import { cookieHeader, sameOrigin, SESSION_COOKIE, NONCE_COOKIE } from '@/lib/google-auth';

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origem não autorizada.' }, { status: 403 });
  const response = new Response(null, {
    status: 303, headers: { Location: '/admin', 'Cache-Control': 'no-store' },
  });
  response.headers.append('Set-Cookie', cookieHeader(SESSION_COOKIE, '', request, 0));
  response.headers.append('Set-Cookie', cookieHeader(NONCE_COOKIE, '', request, 0));
  return response;
}
