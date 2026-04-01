import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

// Lazy-initialize the database connection to avoid top-level throws that
// crash the serverless function before the handler's try/catch can run.
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is not set');
    }
    const client = postgres(url);
    _db = drizzle(client, { schema });
  }
  return _db;
}

// Export a proxy that lazily initializes on first property access.
// This preserves the `db.select()`, `db.insert()` etc. API without
// requiring callers to change from `db` to `getDb()`.
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export { schema };
