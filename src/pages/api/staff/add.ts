// src/pages/api/staff/add.ts
import type { APIRoute } from 'astro';
import db from '../../../lib/turso';
import fs from 'node:fs';
import path from 'node:path';

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    const name = formData.get('staff_name')?.toString();
    const position = formData.get('staff_position')?.toString();
    const description = formData.get('staff_description')?.toString();
    const imageFile = formData.get('staff_image');

    // 1. Validación estricta de los datos
    if (!name || !position || !(imageFile instanceof File) || imageFile.size === 0) {
      // Si falta algo, redirigimos con un error claro.
      return redirect('/admin?error=missing_staff_fields#staff', 303);
    }

    // 2. Subida del archivo
    const uploadDir = path.join(process.cwd(), 'public/uploads/staff');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const uniqueFilename = `${Date.now()}-${imageFile.name.replace(/\s+/g, '_')}`;
    const savePath = path.join(uploadDir, uniqueFilename);
    await fs.promises.writeFile(savePath, Buffer.from(await imageFile.arrayBuffer()));
    const imageUrl = `/uploads/staff/${uniqueFilename}`;

    // 3. Inserción en la base de datos
    const { rows: countResult } = await db.execute("SELECT COUNT(*) as count FROM staff");
    const sortOrder = (countResult[0]?.count as number) || 0;

    await db.execute({
        sql: "INSERT INTO staff (name, position, description, imageUrl, sort_order) VALUES (?, ?, ?, ?, ?)",
        args: [name, position, description, imageUrl, sortOrder],
    });

  } catch (e) {
    // Si ocurre cualquier otro error, lo capturamos y lo mostramos.
    console.error("Error al añadir miembro del equipo:", e);
    const errorMessage = encodeURIComponent(e.message);
    return redirect(`/admin?error=${errorMessage}#staff`, 303);
  }

  // 4. Si todo sale bien, redirigimos con un mensaje de éxito.
  return redirect('/admin?success=staff_added#staff', 303);
};
