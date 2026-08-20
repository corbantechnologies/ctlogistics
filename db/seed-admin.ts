/**
 * Admin Account Seeder
 * ─────────────────────────────────────────────────────────────────
 * Run ONCE to create the initial admin/dispatcher accounts.
 * Command: npm run db:seed-admin
 *
 * After running, sign in at /admin/login with the credentials below.
 * Change the passwords immediately after first login (TODO: add
 * change-password flow in Phase 2).
 *
 * To add more admins later: re-run with different ADMIN_ACCOUNTS entries,
 * or build the invite UI in Phase 2.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

// ── Configure these before running ────────────────────────────────────────────
const ADMIN_ACCOUNTS = [
  {
    name: "Super Admin",
    email: "admin@ctlogistics.co.ke",
    password: "ChangeMe@2025!",   // ← CHANGE THIS
    role: "ADMIN" as const,
  },
  {
    name: "Dispatcher One",
    email: "dispatch@ctlogistics.co.ke",
    password: "ChangeMe@2025!",   // ← CHANGE THIS
    role: "DISPATCHER" as const,
  },
];
// ─────────────────────────────────────────────────────────────────────────────

async function hashPassword(plain: string): Promise<string> {
  // better-auth uses argon2 internally, but for direct DB seeding we
  // use the same hashing util it exposes so the login flow works correctly.
  const { createHash } = await import("crypto");
  // bcrypt-style: we use better-auth's password utility if available,
  // otherwise fall back to the same bcrypt implementation it uses.
  try {
    const { hashPassword: baHash } = await import("better-auth/crypto");
    return baHash(plain);
  } catch {
    // Fallback: SHA-256 hex (NOT secure for production — see note below)
    console.warn(
      "⚠️  Could not import better-auth/crypto. Using SHA-256 fallback.\n" +
      "   Ensure better-auth is installed before running this script.\n" +
      "   Run: npm install first."
    );
    return createHash("sha256").update(plain).digest("hex");
  }
}

async function seedAdmins() {
  const client = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(client, { schema });

  console.log("👤 Seeding admin accounts...\n");

  for (const account of ADMIN_ACCOUNTS) {
    // Check if already exists
    const existing = await db.query.adminUsers.findFirst({
      where: eq(schema.adminUsers.email, account.email),
    });

    if (existing) {
      console.log(`  ⏭  Skipped (already exists): ${account.email}`);
      continue;
    }

    const hashedPassword = await hashPassword(account.password);

    await db.insert(schema.adminUsers).values({
      name: account.name,
      email: account.email,
      role: account.role,
      hashedPassword,
      isActive: true,
    });

    console.log(`  ✓  Created [${account.role}]: ${account.email}`);
    console.log(`     Password: ${account.password}  ← change this now!\n`);
  }

  console.log("✅  Admin seeding complete.");
  console.log("→  Sign in at: /admin/login\n");
  process.exit(0);
}

seedAdmins().catch((err) => {
  console.error("❌ Admin seed failed:", err);
  process.exit(1);
});