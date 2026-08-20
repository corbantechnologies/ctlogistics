import { db } from "@/db";
import { routeRateCards, routes } from "@/db/schema";
import { and, eq, isNull, lte, gte, or } from "drizzle-orm";
import type { vehicleCategoryEnum } from "@/db/schema";

export type VehicleCategory = (typeof vehicleCategoryEnum.enumValues)[number];

// Per-km rates (KES) by vehicle category — used for off-route dynamic pricing
const PER_KM_RATES: Record<VehicleCategory, number> = {
  SALOON: 45,
  COMPACT_SUV: 60,
  PRADO_LUXURY: 90,
  SAFARI_CRUISER_4X4: 130,
  TOUR_VAN: 75,
  MINIBUS_14_SEATER: 85,
  COASTER_33_SEATER: 100,
  COACH_50_SEATER: 130,
};

// Daily base rates (KES/day) for self-drive car rental
const DAILY_RATES: Record<VehicleCategory, number> = {
  SALOON: 3500,
  COMPACT_SUV: 5000,
  PRADO_LUXURY: 10000,
  SAFARI_CRUISER_4X4: 18000,
  TOUR_VAN: 8000,
  MINIBUS_14_SEATER: 9000,
  COASTER_33_SEATER: 15000,
  COACH_50_SEATER: 25000,
};

// Delivery fee per km (KES) when vehicle is delivered to client location
const DELIVERY_RATE_PER_KM = 80;
const DELIVERY_BASE_FEE = 500; // flat base

export type QuoteResult = {
  sellRate: number;
  buyRate: number;
  margin: number;
  marginPct: number;
  breakdown: string[];
  routeId?: string;
};

/**
 * Looks up a predefined corridor rate card.
 * Returns the active rate valid at the current time (respects validFrom/validUntil).
 */
export async function calculateCorridorQuote(
  routeId: string,
  category: VehicleCategory
): Promise<QuoteResult | null> {
  const now = new Date();

  const card = await db.query.routeRateCards.findFirst({
    where: and(
      eq(routeRateCards.routeId, routeId),
      eq(routeRateCards.vehicleCategory, category),
      eq(routeRateCards.isActive, true),
      or(isNull(routeRateCards.validFrom), lte(routeRateCards.validFrom, now)),
      or(isNull(routeRateCards.validUntil), gte(routeRateCards.validUntil, now))
    ),
  });

  if (!card) return null;

  const sell = parseFloat(card.retailSellRate);
  const buy = parseFloat(card.defaultBuyRate);

  return {
    sellRate: sell,
    buyRate: buy,
    ...calcMargin(sell, buy),
    breakdown: ["Corridor fixed rate (includes tolls & deadhead return)"],
    routeId,
  };
}

/**
 * Off-route dynamic pricing fallback.
 * Formula: distanceKm × perKmRate × returnMultiplier
 */
export function calculateDynamicQuote(
  distanceKm: number,
  category: VehicleCategory,
  returnMultiplier: 1 | 1.5 | 2 = 1.5
): QuoteResult {
  const perKm = PER_KM_RATES[category];
  const sell = Math.ceil(distanceKm * perKm * returnMultiplier);
  // Platform buys at 70% of sell for dynamic routes
  const buy = Math.ceil(sell * 0.7);

  return {
    sellRate: sell,
    buyRate: buy,
    ...calcMargin(sell, buy),
    breakdown: [
      `${distanceKm} km × KES ${perKm}/km`,
      `Return leg multiplier: ${returnMultiplier}×`,
    ],
  };
}

/**
 * Self-drive car rental pricing.
 * Formula: days × dailyRate + deliveryFee
 */
export function calculateRentalQuote(
  days: number,
  category: VehicleCategory,
  deliveryDistanceKm = 0
): QuoteResult {
  const dailyRate = DAILY_RATES[category];
  const rentalBase = days * dailyRate;
  const deliveryFee =
    deliveryDistanceKm > 0
      ? DELIVERY_BASE_FEE + deliveryDistanceKm * DELIVERY_RATE_PER_KM
      : 0;
  const sell = rentalBase + deliveryFee;
  // Buy = daily rate partner gets (platform keeps delivery margin)
  const buy = Math.ceil(rentalBase * 0.72);

  return {
    sellRate: sell,
    buyRate: buy,
    ...calcMargin(sell, buy),
    breakdown: [
      `${days} day${days > 1 ? "s" : ""} × KES ${dailyRate.toLocaleString()}/day`,
      ...(deliveryFee > 0
        ? [`Delivery fee: KES ${deliveryFee.toLocaleString()}`]
        : []),
    ],
  };
}

function calcMargin(sell: number, buy: number) {
  const margin = sell - buy;
  const marginPct = parseFloat(((margin / sell) * 100).toFixed(1));
  return { margin, marginPct };
}

/**
 * Utility for the dispatcher's margin display.
 */
export function calculateMargin(sellRate: number, buyRate: number) {
  return calcMargin(sellRate, buyRate);
}

/**
 * Fetches all active routes for the quote wizard dropdown.
 */
export async function getActiveRoutes() {
  return db.query.routes.findMany({
    where: eq(routes.isActive, true),
    orderBy: routes.name,
  });
}
