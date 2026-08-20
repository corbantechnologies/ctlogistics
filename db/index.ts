import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";
import * as schema from "./schema";

config({ path: ".env.local" });
config({ path: ".env" });

// Railway PostgreSQL — connection string from DATABASE_URL env var.
// In serverless environments (Vercel), postgres-js handles connection pooling automatically.
const client = postgres(process.env.DATABASE_URL!, {
  max: 1, // Vercel serverless: keep a single connection per lambda invocation
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
});

export const db = drizzle(client, { schema });

export type DB = typeof db;
