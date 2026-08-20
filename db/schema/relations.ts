import { relations } from "drizzle-orm";
import { partners, drivers } from "./partners";
import { assets } from "./assets";
import { bookings } from "./bookings";
import { payments } from "./payments";
import { tripLegs } from "./tripLegs";
import { handovers } from "./handovers";
import { routes, routeRateCards } from "./routes";
import { partnerUsers } from "./users";

// ── Partners ───────────────────────────────────────────────────────────────────
export const partnersRelations = relations(partners, ({ many }) => ({
  assets: many(assets),
  drivers: many(drivers),
  partnerUsers: many(partnerUsers),
}));

export const driversRelations = relations(drivers, ({ one, many }) => ({
  partner: one(partners, { fields: [drivers.partnerId], references: [partners.id] }),
  tripLegs: many(tripLegs),
}));

// ── Assets ─────────────────────────────────────────────────────────────────────
export const assetsRelations = relations(assets, ({ one, many }) => ({
  partner: one(partners, { fields: [assets.partnerId], references: [partners.id] }),
  tripLegs: many(tripLegs),
}));

// ── Bookings ───────────────────────────────────────────────────────────────────
export const bookingsRelations = relations(bookings, ({ many }) => ({
  tripLegs: many(tripLegs),
  handovers: many(handovers),
  payments: many(payments),
}));

// ── Payments ───────────────────────────────────────────────────────────────────
export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, { fields: [payments.bookingId], references: [bookings.id] }),
}));

// ── Trip Legs ──────────────────────────────────────────────────────────────────
export const tripLegsRelations = relations(tripLegs, ({ one, many }) => ({
  booking: one(bookings, { fields: [tripLegs.bookingId], references: [bookings.id] }),
  assignedAsset: one(assets, { fields: [tripLegs.assignedAssetId], references: [assets.id] }),
  driver: one(drivers, { fields: [tripLegs.driverId], references: [drivers.id] }),
  handovers: many(handovers),
}));

// ── Handovers ─────────────────────────────────────────────────────────────────
export const handoversRelations = relations(handovers, ({ one }) => ({
  booking: one(bookings, { fields: [handovers.bookingId], references: [bookings.id] }),
  tripLeg: one(tripLegs, { fields: [handovers.tripLegId], references: [tripLegs.id] }),
}));

// ── Routes & Rate Cards ───────────────────────────────────────────────────────
export const routesRelations = relations(routes, ({ many }) => ({
  rateCards: many(routeRateCards),
}));

export const routeRateCardsRelations = relations(routeRateCards, ({ one }) => ({
  route: one(routes, { fields: [routeRateCards.routeId], references: [routes.id] }),
}));

// ── Partner Users ─────────────────────────────────────────────────────────────
export const partnerUsersRelations = relations(partnerUsers, ({ one }) => ({
  partner: one(partners, { fields: [partnerUsers.partnerId], references: [partners.id] }),
}));