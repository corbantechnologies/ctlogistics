import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { bookingTypeEnum, bookingStatusEnum } from "./enums";

// Tables only — relations in relations.ts

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventGroupId: varchar("event_group_id", { length: 100 }),
  bookingType: bookingTypeEnum("booking_type").notNull(),
  status: bookingStatusEnum("status").default("PENDING").notNull(),
  accessToken: varchar("access_token", { length: 128 }).notNull().unique(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientPhone: varchar("client_phone", { length: 50 }).notNull(),
  clientEmail: varchar("client_email", { length: 255 }),
  clientIdNumber: varchar("client_id_number", { length: 100 }),
  totalSellAmount: numeric("total_sell_amount", { precision: 12, scale: 2 }).notNull(),
  totalBuyAmount: numeric("total_buy_amount", { precision: 12, scale: 2 }).notNull(),
  securityDeposit: numeric("security_deposit", { precision: 12, scale: 2 }).default("0").notNull(),
  isDepositPaid: boolean("is_deposit_paid").default(false).notNull(),
  isFullPaymentReceived: boolean("is_full_payment_received").default(false).notNull(),
  rentalStart: timestamp("rental_start"),
  rentalEnd: timestamp("rental_end"),
  deliveryAddress: text("delivery_address"),
  collectionAddress: text("collection_address"),
  deliveryFee: numeric("delivery_fee", { precision: 12, scale: 2 }).default("0"),
  paxCount: integer("pax_count"),
  specialRequirements: text("special_requirements"),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});