import type { APIRoute } from 'astro';
import { getInitialData } from '@/lib/admin-data';

export const GET: APIRoute = async () => {
  try {
    const data = await getInitialData();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error("API Error fetching initial data:", e);
    return new Response(JSON.stringify({ error: 'Failed to fetch initial data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
