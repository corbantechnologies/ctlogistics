import {
  pgTable,
  uuid,
  integer,
  text,
  varchar,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { legStatusEnum } from "./enums";
import { bookings } from "./bookings";
import { assets } from "./assets";
import { drivers } from "./partners";

// Tables only — relations in relations.ts

export const tripLegs = pgTable("trip_legs", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .references(() => bookings.id, { onDelete: "cascade" })
    .notNull(),
  legSequence: integer("leg_sequence").notNull(),
  originLocation: text("origin_location").notNull(),
  destinationLocation: text("destination_location").notNull(),
  scheduledTime: timestamp("scheduled_time").notNull(),
  actualStartTime: timestamp("actual_start_time"),
  actualEndTime: timestamp("actual_end_time"),
  status: legStatusEnum("status").default("SCHEDULED").notNull(),
  assignedAssetId: uuid("assigned_asset_id").references(() => assets.id),
  driverId: uuid("driver_id").references(() => drivers.id),
  partnerPayout: numeric("partner_payout", { precision: 12, scale: 2 }).notNull().default("0"),
  driverDailyAllowance: numeric("driver_daily_allowance", { precision: 12, scale: 2 }),
  parkEntryGate: varchar("park_entry_gate", { length: 255 }),
  lodgeDropPoint: varchar("lodge_drop_point", { length: 255 }),
  handoverToken: varchar("handover_token", { length: 128 }).unique(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});