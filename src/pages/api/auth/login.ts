import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const password = formData.get('password')?.toString();

  // Compara la contraseña del formulario con la variable de entorno
  if (password === import.meta.env.ADMIN_PASSWORD) {
    // Si es correcta, crea la cookie de sesión
    cookies.set('session', 'admin-logged-in', {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD, // Solo HTTPS en producción
      maxAge: 60 * 60 * 24 * 7, // 1 semana
    });
    return redirect('/admin/', 302); // Redirige al panel de admin
  }

  // Si es incorrecta, redirige de vuelta al login con un mensaje de error
  return redirect('/login?error=Contraseña incorrecta', 302);
};
