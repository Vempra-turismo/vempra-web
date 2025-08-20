import type { APIRoute } from 'astro';
import db from '@/lib/turso'; // Asegúrate que la ruta sea correcta, idealmente usando el alias @

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug is required' }), { status: 400 });
  }

  try {
    const result = await db.execute({
      sql: `
        SELECT 
          t.*, 
          c.name as country_name, c.url as country_url,
          l.name as locality_name, l.url as locality_url,
          GROUP_CONCAT(DISTINCT d.name) as departure_names,
          GROUP_CONCAT(DISTINCT tags.name) as tag_names
        FROM trips t
        LEFT JOIN localities l ON t.locality_id = l.id
        LEFT JOIN countries c ON l.country_id = c.id
        LEFT JOIN trip_tags tt ON t.id = tt.trip_id
        LEFT JOIN tags ON tt.tag_id = tags.id
        LEFT JOIN trip_departures td ON t.id = td.trip_id
        LEFT JOIN departures d ON td.departure_id = d.id
        WHERE t.url = ?
        GROUP BY t.id
      `,
      args: [slug],
    });

    if (result.rows.length === 0) {
      return new Response(null, { status: 404, statusText: 'Not Found' });
    }

    const trip: any = result.rows[0];

    const imagesResult = await db.execute({
        sql: "SELECT imageUrl FROM trip_images WHERE trip_id = ?",
        args: [trip.id]
    });
    const additionalImages = imagesResult.rows.map((row: any) => row.imageUrl);

    const responseData = {
      trip,
      additionalImages
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error(`API Error fetching trip for slug ${slug}:`, e);
    return new Response(JSON.stringify({ error: 'Failed to fetch trip data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
