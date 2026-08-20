/**
 * Seed script — run ONCE on initial database setup.
 * Command: npx tsx db/seed.ts
 *
 * Populates: corridors (routes) + rate cards per vehicle category.
 * Do NOT include in the automated build pipeline.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { db } from "./index";
import { routes, routeRateCards } from "./schema";

const CORRIDORS = [
  {
    name: "Mombasa → Nairobi",
    originZone: "Mombasa CBD",
    destinationZone: "Nairobi CBD",
    estimatedDurationMins: 480,
    standardDistanceKm: 490,
    tollsIncluded: true,
    deadheadIncluded: true,
  },
  {
    name: "Mombasa → Diani (Ukunda)",
    originZone: "Mombasa CBD",
    destinationZone: "Diani / Ukunda",
    estimatedDurationMins: 60,
    standardDistanceKm: 40,
    tollsIncluded: false,
    deadheadIncluded: true,
  },
  {
    name: "Mombasa → Malindi",
    originZone: "Mombasa CBD",
    destinationZone: "Malindi",
    estimatedDurationMins: 120,
    standardDistanceKm: 120,
    tollsIncluded: false,
    deadheadIncluded: true,
  },
  {
    name: "Mombasa → Voi / Tsavo",
    originZone: "Mombasa CBD",
    destinationZone: "Voi / Tsavo East Gate",
    estimatedDurationMins: 150,
    standardDistanceKm: 160,
    tollsIncluded: false,
    deadheadIncluded: true,
  },
  {
    name: "Nairobi → Amboseli",
    originZone: "Nairobi CBD / JKIA",
    destinationZone: "Amboseli National Park",
    estimatedDurationMins: 240,
    standardDistanceKm: 230,
    tollsIncluded: false,
    deadheadIncluded: true,
  },
  {
    name: "Nairobi → Maasai Mara",
    originZone: "Nairobi CBD / JKIA",
    destinationZone: "Maasai Mara (Sekenani Gate)",
    estimatedDurationMins: 300,
    standardDistanceKm: 280,
    tollsIncluded: false,
    deadheadIncluded: true,
  },
  {
    name: "JKIA → Naivasha",
    originZone: "JKIA",
    destinationZone: "Naivasha",
    estimatedDurationMins: 90,
    standardDistanceKm: 90,
    tollsIncluded: false,
    deadheadIncluded: true,
  },
  {
    name: "Moi Airport → Nyali / Bamburi",
    originZone: "Moi International Airport",
    destinationZone: "Nyali / Bamburi",
    estimatedDurationMins: 20,
    standardDistanceKm: 12,
    tollsIncluded: false,
    deadheadIncluded: false,
  },
];

// KES rates per corridor — buy rate is COGS, sell rate is what client pays.
// Adjust these to reflect your actual market rates before going live.
const RATES_BY_CATEGORY: Record<
  string,
  { buyRate: string; sellRate: string }
> = {
  SALOON: { buyRate: "3500", sellRate: "5000" },
  COMPACT_SUV: { buyRate: "4500", sellRate: "6500" },
  PRADO_LUXURY: { buyRate: "8000", sellRate: "12000" },
  SAFARI_CRUISER_4X4: { buyRate: "12000", sellRate: "18000" },
  TOUR_VAN: { buyRate: "6000", sellRate: "9000" },
  MINIBUS_14_SEATER: { buyRate: "7000", sellRate: "10500" },
  COASTER_33_SEATER: { buyRate: "14000", sellRate: "20000" },
  COACH_50_SEATER: { buyRate: "22000", sellRate: "32000" },
};

const VEHICLE_CATEGORIES = Object.keys(RATES_BY_CATEGORY) as Array<
  keyof typeof RATES_BY_CATEGORY
>;

async function seed() {
  console.log("🌱 Seeding database...");

  for (const corridor of CORRIDORS) {
    const [route] = await db
      .insert(routes)
      .values({
        name: corridor.name,
        originZone: corridor.originZone,
        destinationZone: corridor.destinationZone,
        estimatedDurationMins: corridor.estimatedDurationMins,
        standardDistanceKm: corridor.standardDistanceKm,
        tollsIncluded: corridor.tollsIncluded,
        deadheadIncluded: corridor.deadheadIncluded,
        isActive: true,
      })
      .returning();

    console.log(`  ✓ Route: ${corridor.name} (${route.id})`);

    for (const category of VEHICLE_CATEGORIES) {
      const { buyRate, sellRate } = RATES_BY_CATEGORY[category];

      // Scale rates proportionally to distance relative to Mombasa→Nairobi baseline
      const distanceFactor = corridor.standardDistanceKm / 490;
      const scaledBuy = (parseFloat(buyRate) * distanceFactor).toFixed(2);
      const scaledSell = (parseFloat(sellRate) * distanceFactor).toFixed(2);

      await db.insert(routeRateCards).values({
        routeId: route.id,
        vehicleCategory: category as any,
        defaultBuyRate: scaledBuy,
        retailSellRate: scaledSell,
        isActive: true,
      });
    }

    console.log(`    ✓ Rate cards seeded for ${VEHICLE_CATEGORIES.length} categories`);
  }

  console.log("\n✅ Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
