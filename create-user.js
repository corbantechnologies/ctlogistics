const postgres = require("postgres");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL);

async function run() {
  try {
    const hashedPassword = await bcrypt.hash("ctdrive2024", 12);
    const email = "admin@ctdrive.co.ke";
    
    await sql`
      INSERT INTO users (name, email, role, hashed_password)
      VALUES ('System Admin', ${email}, 'ADMIN', ${hashedPassword})
      ON CONFLICT (email) DO UPDATE SET hashed_password = ${hashedPassword}
    `;
    
    console.log(`Created admin user with email: ${email} and password: ctdrive2024`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
