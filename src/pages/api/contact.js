export const prerender = false;
import resend from '../../lib/resend';

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');

    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({
        message: "Todos los campos son obligatorios."
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Para desarrollo, Resend permite enviar desde 'onboarding@resend.dev' sin verificar un dominio.
    // En producción, usará el email de tu variable de entorno.
    const fromEmail = import.meta.env.DEV
      ? 'onboarding@resend.dev'
      : import.meta.env.RESEND_FROM_EMAIL;

    const toEmail = import.meta.env.RESEND_TO_EMAIL;

    console.log(`Intentando enviar email desde '${fromEmail}' hacia '${toEmail}'`);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Nuevo mensaje de contacto: ${subject}`,
      html: `
        <p>Has recibido un nuevo mensaje de tu formulario de contacto.</p>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Asunto:</strong> ${subject}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      reply_to: email,
    });

    if (error) {
      console.error({ error });
      // El objeto de error de Resend puede tener el mensaje en `error.message` o `error.error`
      const resendMessage = error.message || error.error || 'Error desconocido de Resend.';
      return new Response(JSON.stringify({ message: `Error al enviar el email: ${resendMessage}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      message: '¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.'
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error en el endpoint de contacto:', error);
    return new Response(JSON.stringify({
      message: 'Hubo un error en el servidor. Por favor, inténtalo de nuevo más tarde.'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}