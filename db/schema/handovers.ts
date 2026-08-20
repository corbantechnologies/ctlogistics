import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { handoverTypeEnum } from "./enums";
import { bookings } from "./bookings";
import { tripLegs } from "./tripLegs";

export type HandoverPhotoUrls = {
  front: string;
  rear: string;
  leftSide: string;
  rightSide: string;
  interior: string;
};

export const handovers = pgTable("handovers", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .references(() => bookings.id, { onDelete: "cascade" })
    .notNull(),
  tripLegId: uuid("trip_leg_id").references(() => tripLegs.id),
  handoverType: handoverTypeEnum("handover_type").notNull(),
  runnerName: varchar("runner_name", { length: 255 }).notNull(),
  runnerPhone: varchar("runner_phone", { length: 50 }).notNull(),
  odometerReading: integer("odometer_reading").notNull(),
  fuelLevel: varchar("fuel_level", { length: 20 }).notNull(),
  photoUrls: jsonb("photo_urls").$type<HandoverPhotoUrls>().notNull(),
  damageNotes: text("damage_notes"),
  clientSignatureUrl: text("client_signature_url").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});