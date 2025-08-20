import type { APIRoute } from 'astro';
import db from '@/lib/turso';
import { isUserAuthenticated, unauthorizedResponse } from '@/lib/auth';

export const GET: APIRoute = async (context) => {
  if (!isUserAuthenticated(context)) {
    return unauthorizedResponse();
  }

  try {
    const tripsResult = await db.execute({
      sql: `
        SELECT 
          t.id, t.title, t.price, t.days, t.travel_type,
          l.name as locality_name, c.name as country_name,
          GROUP_CONCAT(DISTINCT d.name) as departure_names
        FROM trips t
        LEFT JOIN localities l ON t.locality_id = l.id
        LEFT JOIN countries c ON l.country_id = c.id
        LEFT JOIN trip_departures td ON t.id = td.trip_id
        LEFT JOIN departures d ON td.departure_id = d.id
        GROUP BY t.id
        ORDER BY t.id DESC
      `,
      args: []
    });

    return new Response(JSON.stringify(tripsResult.rows), { status: 200 });
  } catch (e) {
    console.error("API Error fetching trips list for admin:", e);
    return new Response(JSON.stringify({ error: 'Failed to fetch trips list' }), { status: 500 });
  }
};
