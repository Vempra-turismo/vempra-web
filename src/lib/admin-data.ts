import db from '@/lib/turso';

// --- Funciones para obtener datos iniciales ---
export async function getInitialData() {
    const [countries, localities, tags, departures, staff] = await Promise.all([
        db.execute("SELECT id, name FROM countries ORDER BY name"),
        db.execute("SELECT id, name, country_id FROM localities ORDER BY name"),
        db.execute("SELECT id, name FROM tags ORDER BY name"),
        db.execute("SELECT id, name FROM departures ORDER BY name"),
        db.execute("SELECT * FROM staff ORDER BY sort_order, name")
    ]);

    return {
        countries: countries.rows,
        localities: localities.rows,
        tags: tags.rows,
        departures: departures.rows,
        staff: staff.rows,
    };
}

export async function getTrips() {
    const result = await db.execute({
        sql: `
          SELECT 
            t.id, t.title, t.price, t.days, t.travel_type,
            l.name as locality_name, c.name as country_name,
            d.name as departure_name
          FROM trips t
          LEFT JOIN localities l ON t.locality_id = l.id
          LEFT JOIN countries c ON l.country_id = c.id
          LEFT JOIN departures d ON t.departure_id = d.id
          ORDER BY t.id DESC
        `,
        args: []
    });
    return result.rows;
}

// --- Funciones para obtener datos para editar ---
export async function getTripToEdit(id: string) {
    const result = await db.execute({ sql: "SELECT * FROM trips WHERE id = ?", args: [id] });
    if (result.rows.length === 0) return { trip: null, tags: [], additionalImages: [] };

    const trip = result.rows[0];
    const [tagsResult, imagesResult] = await Promise.all([
        db.execute({ sql: "SELECT tag_id FROM trip_tags WHERE trip_id = ?", args: [id] }),
        db.execute({ sql: "SELECT imageUrl FROM trip_images WHERE trip_id = ?", args: [id] })
    ]);

    return {
        trip,
        tags: tagsResult.rows.map((row: any) => row.tag_id),
        additionalImages: imagesResult.rows.map((row: any) => row.imageUrl)
    };
}

export async function getCategoryToEdit(type: 'country' | 'locality' | 'tag' | 'departure' | 'staff', id: string) {
    const tableNameMap = {
        country: 'countries',
        locality: 'localities',
        tag: 'tags',
        departure: 'departures',
        staff: 'staff'
    };
    const tableName = tableNameMap[type];
    if (!tableName) return null;

    const result = await db.execute({ sql: `SELECT * FROM ${tableName} WHERE id = ?`, args: [id] });
    return result.rows.length > 0 ? result.rows[0] : null;
}
