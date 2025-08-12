export const prerender = false;

export function POST({ cookies, redirect }) {
  // Elimina la cookie de sesión
  cookies.delete('session', {
    path: '/',
  });

  // Redirige al usuario a la página de login
  return redirect('/login');
}