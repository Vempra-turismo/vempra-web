import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(({ url, cookies, redirect, request }, next) => {
  const pathname = url.pathname;

  // Proteger toda la página /admin
  if (pathname.startsWith('/admin')) {
    if (cookies.get('session')?.value !== 'admin-logged-in') {
      // Para visitas a la página, redirigir al login
      return redirect('/login');
    }
  }

  // Proteger las operaciones de escritura (POST, PUT, DELETE) en la API
  if (pathname.startsWith('/api/trips')) {
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
      if (cookies.get('session')?.value !== 'admin-logged-in') {
        // Para llamadas a la API, devolver un error de no autorizado
        return new Response(JSON.stringify({ message: 'Authentication required' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  }

  return next();
});