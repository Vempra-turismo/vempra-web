// src/lib/turso.js
import { createClient } from '@libsql/client';

if (!import.meta.env.TURSO_DATABASE_URL) {
  throw new Error('La variable de entorno TURSO_DATABASE_URL no está definida.');
}

if (!import.meta.env.TURSO_AUTH_TOKEN) {
  throw new Error('La variable de entorno TURSO_AUTH_TOKEN no está definida.');
}

const client = createClient({
  url: import.meta.env.TURSO_DATABASE_URL,
  authToken: import.meta.env.TURSO_AUTH_TOKEN,
});

export default client;
