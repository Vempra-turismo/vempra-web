import type { APIRoute } from 'astro';
import db from '@/lib/turso';
import { isUserAuthenticated, unauthorizedResponse } from '@/lib/auth';

export const GET: APIRoute = async (context) => {
  // --- Protección de la ruta de API ---
  if (!isUserAuthenticated(context)) {
    return unauthorizedResponse();
  }

  const { url } = context;
  const editTripId = url.searchParams.get('trip_id');
  const editCategoryType = url.searchParams.get('category_type');
  const editCategoryId = url.searchParams.get('category_id');

  try {
    let data: any = {};

    // --- Caso 1: Editando un Viaje ---
    if (editTripId) {
      const tripResult = await db.execute({
        sql: "SELECT * FROM trips WHERE id = ?",
        args: [editTripId],
      });

      if (tripResult.rows.length === 0) {
        return new Response(JSON.stringify({ error: 'Trip not found' }), { status: 404 });
      }

      const trip = tripResult.rows[0];

      // Fetching related data in parallel
      const tagsPromise = db.execute({
        sql: "SELECT tag_id FROM trip_tags WHERE trip_id = ?",
        args: [editTripId],
      });

      const imagesPromise = db.execute({
        sql: "SELECT imageUrl FROM trip_images WHERE trip_id = ?",
        args: [editTripId],
      });

      const departuresPromise = db.execute({
        sql: "SELECT departure_id FROM trip_departures WHERE trip_id = ?",
        args: [editTripId],
      });

      const [tagsResult, imagesResult, departuresResult] = await Promise.all([
        tagsPromise,
        imagesPromise,
        departuresPromise,
      ]);

      data.trip = trip;
      data.tags = tagsResult.rows.map((row: any) => row.tag_id);
      data.additionalImages = imagesResult.rows.map((row: any) => row.imageUrl);
      data.tripDepartures = departuresResult.rows.map((row: any) => row.departure_id);

    } else if (editCategoryType && editCategoryId) {
      // --- Caso 2: Editando una Categoría (País, Localidad, etc.) ---
      const validTables: { [key: string]: string } = {
        country: 'countries', locality: 'localities', tag: 'tags',
        departure: 'departures', staff: 'staff',
      };
      const tableName = validTables[editCategoryType];
      if (!tableName) {
        return new Response(JSON.stringify({ error: 'Invalid category type' }), { status: 400 });
      }
      const result = await db.execute({ sql: `SELECT * FROM ${tableName} WHERE id = ?`, args: [editCategoryId] });
      data = { [editCategoryType]: result.rows[0] };
    } else {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), { status: 400 });
    }
    
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (e) {
    console.error("API Error fetching edit data:", e);
    return new Response(JSON.stringify({ error: 'Failed to fetch edit data' }), { status: 500 });
  }
};