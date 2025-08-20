import type { APIRoute } from 'astro';
import db from '@/lib/turso';

export const GET: APIRoute = async () => {
  try {
    const { rows: trips } = await db.execute({
      sql: `
      SELECT 
        t.id, t.title, t.slogan, t.url, t.price, t.days, t.imageUrl,
        l.name as locality_name,
        c.name as country_name
      FROM trips t
      LEFT JOIN localities l ON t.locality_id = l.id
      LEFT JOIN countries c ON l.country_id = c.id
      ORDER BY t.id DESC
    `, args: []});
    return new Response(JSON.stringify(trips), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error("API Error fetching destinos:", e);
    return new Response(JSON.stringify({ error: 'Failed to fetch destinos' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
