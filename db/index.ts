import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";
import * as schema from "./schema";

config({ path: ".env.local" });
config({ path: ".env" });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

if (!connectionString) {
  console.warn("⚠️ Warning: DATABASE_URL is not set in environment variables.");
}

// Railway / Vercel PostgreSQL connection configuration
// - max: 1 connection per serverless lambda invocation
// - ssl: rejectUnauthorized: false prevents self-signed SSL handshake failures in production cloud DBs
const client = postgres(connectionString, {
  max: 1,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

export type DB = typeof db;
