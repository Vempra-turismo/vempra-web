import type { APIRoute } from 'astro';
import db from '@/lib/turso';

export const GET: APIRoute = async () => {
  try {
    const { rows: promoTrips } = await db.execute({
        sql: `
            SELECT 
              t.id, t.title, t.slogan, t.url, t.price, t.days, imageUrl, travel_type,
              t.season_name, t.season_year, t.locality_id
            FROM trips t
            JOIN trip_tags tt ON t.id = tt.trip_id
            JOIN tags ON tt.tag_id = tags.id
            WHERE tags.name = 'Promocion'
            ORDER BY t.id DESC
        `,
        args: []
    });
    return new Response(JSON.stringify(promoTrips), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error("API Error fetching promo trips:", e);
    return new Response(JSON.stringify({ error: 'Failed to fetch promo trips' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
