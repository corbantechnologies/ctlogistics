import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  text,
} from "drizzle-orm/pg-core";
import { complianceStatusEnum } from "./enums";

// Tables only — relations are in schema/relations.ts to break circular deps

export const partners = pgTable("partners", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }),
  // Note: not all partners carry PSV insurance — some operate on comprehensive
  // private insurance. Compliance status reflects overall vetting, not just PSV.
  complianceStatus: complianceStatusEnum("compliance_status")
    .default("PENDING")
    .notNull(),
  notes: text("notes"), // Internal vetting notes (insurance type, vetting outcome)
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const drivers = pgTable("drivers", {
  id: uuid("id").defaultRandom().primaryKey(),
  partnerId: uuid("partner_id")
    .references(() => partners.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  licenseNumber: varchar("license_number", { length: 100 }),
  licenseExpiry: timestamp("license_expiry"),
  photoUrl: text("photo_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});