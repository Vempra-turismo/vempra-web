import type { APIContext } from 'astro';

export function isUserAuthenticated(context: APIContext): boolean {
  // Aquí puedes añadir lógica más compleja en el futuro,
  // como verificar la validez de la sesión contra la base de datos.
  return context.cookies.has('session');
}

export function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}

