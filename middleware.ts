import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async ({ cookies, url, redirect }, next) => {
  const pathname = url.pathname;

  // Si el usuario intenta ir a /login pero ya tiene sesión, lo mandamos a /admin
  if (pathname === '/login' && cookies.has('session')) {
    return redirect('/admin', 302);
  }

  // Si intenta acceder a cualquier ruta de /admin sin sesión, lo mandamos a /login
  if (pathname.startsWith('/admin') && !cookies.has('session')) {
    return redirect('/login', 302);
  }

  // Protegemos la API que guarda los viajes
  if (pathname.startsWith('/api/trips') && !cookies.has('session')) {
      return new Response('No autorizado', { status: 401 });
  }

  return next();
});
