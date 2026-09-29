import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & { promptUrlsPool?: Pool };

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  const pool = globalForDb.promptUrlsPool ?? new Pool({ connectionString, max: 10 });
  if (process.env.NODE_ENV !== "production") globalForDb.promptUrlsPool = pool;
  return drizzle(pool, { schema });
}
