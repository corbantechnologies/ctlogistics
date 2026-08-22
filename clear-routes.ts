import { db } from "../db";
import { routes } from "../db/schema/routes";

async function clearRoutes() {
  console.log("Clearing routes...");
  await db.delete(routes);
  console.log("Done.");
  process.exit(0);
}

clearRoutes().catch(console.error);
