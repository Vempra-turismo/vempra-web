import db from '../../lib/turso';

export async function GET() {
  // This endpoint should only be available in development
  if (import.meta.env.PROD) {
    return new Response(
      JSON.stringify({ message: 'This endpoint is only available in development.' }),
      { status: 403 }
    );
  }

  try {
    // Usamos una transacción para asegurar que todas las tablas se creen o ninguna.
    // ¡ADVERTENCIA: Esto eliminará todos los datos existentes en las tablas!
    await db.batch([
      `DROP TABLE IF EXISTS trip_images;`,
      `DROP TABLE IF EXISTS trip_tags;`,
      `DROP TABLE IF EXISTS trips;`,
      `DROP TABLE IF EXISTS tags;`,
      `DROP TABLE IF EXISTS localities;`,
      `DROP TABLE IF EXISTS countries;`,
      `CREATE TABLE IF NOT EXISTS countries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE
      );`,
      `CREATE TABLE IF NOT EXISTS localities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          country_id INTEGER NOT NULL,
          FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE RESTRICT,
          UNIQUE(name, country_id)
      );`,
      `CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE
      );`,
      `CREATE TABLE IF NOT EXISTS trips (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          slogan TEXT,
          url TEXT NOT NULL,
          price REAL,
          days TEXT,
          generalDetails TEXT,
          imageUrl TEXT NOT NULL,
          travel_type TEXT,
          locality_id INTEGER,
          season_year INTEGER,
          season_name TEXT,
          itinerary TEXT,
          hotels_info TEXT,
          flights_info TEXT,
          FOREIGN KEY (locality_id) REFERENCES localities(id) ON DELETE SET NULL
      );`,
      `CREATE TABLE IF NOT EXISTS trip_tags (
          trip_id INTEGER NOT NULL,
          tag_id INTEGER NOT NULL,
          PRIMARY KEY (trip_id, tag_id),
          FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS trip_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          trip_id INTEGER NOT NULL,
          imageUrl TEXT NOT NULL,
          FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
      );`
    ], 'write');

    return new Response(JSON.stringify({ message: "¡Éxito! Todas las tablas han sido creadas en tu base de datos." }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ message: "Error al crear las tablas.", error: e.message }), { status: 500 });
  }
}