export const prerender = false;

export async function POST({ request, cookies }) {
  try {
    const body = await request.json();
    const password = body.password;

    if (password === undefined) {
      throw new Error("El campo 'password' falta en el cuerpo de la solicitud.");
    }

    // ¡IMPORTANTE! Compara con una variable de entorno, no con un valor hardcodeado.
    if (password === import.meta.env.ADMIN_PASSWORD) {
      // La contraseña es correcta. Establecemos una cookie.
      cookies.set('session', 'admin-logged-in', {
        path: '/',
        httpOnly: true, // La cookie no es accesible desde JavaScript en el cliente
        secure: import.meta.env.PROD, // Solo se envía sobre HTTPS en producción
        maxAge: 60 * 60 * 24 // Expira en 1 día
      });
      return new Response(JSON.stringify({ success: true, redirect: '/admin' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Contraseña incorrecta
    return new Response(JSON.stringify({ success: false, message: 'Contraseña incorrecta' }), {
      status: 401, // Unauthorized
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error al procesar la solicitud de login:", error);
    return new Response(JSON.stringify({ success: false, message: 'Solicitud inválida. El cuerpo de la solicitud podría estar vacío o malformado.' }), {
      status: 400, // Bad Request
      headers: { 'Content-Type': 'application/json' },
    });
  }
}