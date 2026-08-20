import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { vehicleCategoryEnum } from "./enums";

export const routes = pgTable("routes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  originZone: varchar("origin_zone", { length: 150 }).notNull(),
  destinationZone: varchar("destination_zone", { length: 150 }).notNull(),
  estimatedDurationMins: integer("estimated_duration_mins").notNull(),
  standardDistanceKm: integer("standard_distance_km").notNull(),
  tollsIncluded: boolean("tolls_included").default(false).notNull(),
  deadheadIncluded: boolean("deadhead_included").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const routeRateCards = pgTable("route_rate_cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  routeId: uuid("route_id")
    .references(() => routes.id, { onDelete: "cascade" })
    .notNull(),
  vehicleCategory: vehicleCategoryEnum("vehicle_category").notNull(),
  defaultBuyRate: numeric("default_buy_rate", { precision: 12, scale: 2 }).notNull(),
  retailSellRate: numeric("retail_sell_rate", { precision: 12, scale: 2 }).notNull(),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});