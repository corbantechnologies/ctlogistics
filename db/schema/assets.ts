import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  numeric,
  text,
} from "drizzle-orm/pg-core";
import { vehicleCategoryEnum } from "./enums";
import { partners } from "./partners";

// Tables only — relations defined in relations.ts

export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  partnerId: uuid("partner_id")
    .references(() => partners.id, { onDelete: "cascade" })
    .notNull(),
  plateNumber: varchar("plate_number", { length: 50 }).notNull().unique(),
  makeModel: varchar("make_model", { length: 100 }).notNull(),
  year: integer("year"),
  color: varchar("color", { length: 50 }),
  category: vehicleCategoryEnum("category").notNull(),
  seatingCapacity: integer("seating_capacity").notNull(),
  dailyRate: numeric("daily_rate", { precision: 12, scale: 2 }),
  hourlyRate: numeric("hourly_rate", { precision: 12, scale: 2 }),
  features: text("features"), // e.g. "4x4, AC, Pop-up roof, WiFi, Fridge"
  photos: text("photos"), // JSON string array of image URLs
  offeredServices: text("offered_services"), // e.g. "Airport Transfer, Safari, Self-drive, Chauffeur"
  availabilityStatus: varchar("availability_status", { length: 50 }).default("AVAILABLE").notNull(), // AVAILABLE, ON_TRIP, MAINTENANCE, OFFLINE
  isSelfDriveEligible: boolean("is_self_drive_eligible").default(false).notNull(),
  // PSV insurance is optional — some partners are on comprehensive private insurance
  psvInsuranceExpiry: timestamp("psv_insurance_expiry"),
  comprehensiveInsuranceExpiry: timestamp("comprehensive_insurance_expiry"),
  inspectionExpiry: timestamp("inspection_expiry"),
  hasGpsTracker: boolean("has_gps_tracker").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});