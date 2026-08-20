import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { paymentChannelEnum, paymentStatusEnum } from "./enums";
import { bookings } from "./bookings";

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .references(() => bookings.id, { onDelete: "cascade" })
    .notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  channel: paymentChannelEnum("channel").notNull(),
  status: paymentStatusEnum("status").default("PENDING").notNull(),
  mpesaRef: varchar("mpesa_ref", { length: 100 }),
  paidAt: timestamp("paid_at"),
  recordedBy: varchar("recorded_by", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});