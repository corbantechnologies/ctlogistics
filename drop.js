const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);

async function run() {
  try {
    await sql.unsafe('DROP TABLE IF EXISTS admin_users, partner_users, admin_sessions, partner_sessions, _admin_sessions, _partner_sessions CASCADE;');
    console.log('Dropped tables successfully');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
