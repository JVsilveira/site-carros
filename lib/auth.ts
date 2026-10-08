import { getAdminUser, sameOrigin } from './google-auth';

export async function isAdmin() {
  return !!await getAdminUser();
}

export async function guard(request: Request) {
  if (!sameOrigin(request)) {
    return Response.json({ error: 'Origem não autorizada.' }, { status: 403 });
  }
  if (!await isAdmin()) {
    return Response.json({ error: 'Acesso restrito ao administrador.' }, { status: 403 });
  }
  return null;
}
