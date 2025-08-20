import type { APIRoute } from 'astro';
import db from '@/lib/turso';
import { v2 as cloudinary } from 'cloudinary';
import { Buffer } from 'node:buffer';

cloudinary.config({
    cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
    api_key: import.meta.env.CLOUDINARY_API_KEY,
    api_secret: import.meta.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    // Proteger el endpoint
    if (!cookies.has('session')) {
        return new Response("No autorizado", { status: 401 });
    }

    const formData = await request.formData();
    const id = formData.get('id')?.toString();
    const isNew = !id;

    // --- Manejo de la subida de imagen ---
    const imageFile = formData.get('imageFile') as File;
    let imageUrl = formData.get('imageUrl')?.toString(); // URL existente al editar

    if (imageFile && imageFile.size > 0) {
        try {
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploadResult: any = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'vempra_viajes',
                    },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                uploadStream.end(buffer);
            });

            imageUrl = uploadResult.secure_url;
        } catch (e) {
            console.error("Error al subir la imagen a Cloudinary:", e);
            return new Response("Error al subir la imagen: " + (e as Error).message, { status: 500 });
        }
    }

    const localityIdValue = formData.get('locality_id')?.toString();
    const seasonYearValue = formData.get('season_year')?.toString();

    const tripData = {
        title: formData.get('title')?.toString(),
        url: formData.get('url')?.toString(),
        slogan: formData.get('slogan')?.toString() || null,
        price: formData.get('price')?.toString(),
        days: formData.get('days')?.toString(),
        imageUrl: imageUrl,
        locality_id: localityIdValue && localityIdValue.length > 0 ? localityIdValue : null,
        travel_type: formData.get('travel_type')?.toString(),
        season_name: formData.get('season_name')?.toString() || null,
        season_year: seasonYearValue && seasonYearValue.length > 0 ? parseInt(seasonYearValue) : null,
    };

    const selectedTagIds = formData.getAll('tags').map(tagId => tagId.toString());
    const selectedDepartureIds = formData.getAll('departure_ids').map(id => id.toString());

    try {
        let tripId = id;

        if (isNew) {
            const result = await db.execute({
                sql: `
                    INSERT INTO trips (title, url, slogan, price, days, imageUrl, locality_id, travel_type, season_name, season_year)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    RETURNING id;
                `,
                args: Object.values(tripData)
            });
            tripId = result.rows[0].id.toString();
        } else {
            await db.execute({
                sql: `
                    UPDATE trips SET
                        title = ?, url = ?, slogan = ?, price = ?, days = ?, imageUrl = ?, locality_id = ?, 
                        travel_type = ?, season_name = ?, season_year = ?
                    WHERE id = ?
                `,
                args: [...Object.values(tripData), tripId]
            });
        }

        const batchStatements = [
            { sql: "DELETE FROM trip_tags WHERE trip_id = ?", args: [tripId] },
            { sql: "DELETE FROM trip_departures WHERE trip_id = ?", args: [tripId] }
        ];

        for (const tagId of selectedTagIds) {
            batchStatements.push({ sql: "INSERT INTO trip_tags (trip_id, tag_id) VALUES (?, ?)", args: [tripId, tagId] });
        }

        for (const departureId of selectedDepartureIds) {
            batchStatements.push({ sql: "INSERT INTO trip_departures (trip_id, departure_id) VALUES (?, ?)", args: [tripId, departureId] });
        }

        if (batchStatements.length > 2) {
            await db.batch(batchStatements, 'write');
        }

        return redirect('/admin?success=trip_saved#listado');

    } catch (e) {
        console.error(e);
        const errorMessage = encodeURIComponent((e as Error).message);
        return redirect(`/admin?error=${errorMessage}#editor`);
    }
};
