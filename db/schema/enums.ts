import { pgEnum } from "drizzle-orm/pg-core";

export const bookingTypeEnum = pgEnum("booking_type", [
  "CAR_RENTAL",
  "INTER_COUNTY_TRANSFER",
  "ZONAL_TRANSFER",
  "SAFARI_TOUR",
  "EVENT_CHARTER",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "PENDING",
  "CONFIRMED",
  "DISPATCHED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const vehicleCategoryEnum = pgEnum("vehicle_category", [
  "SALOON",             // Premio, Allion, Fielder
  "COMPACT_SUV",        // RAV4, Vanguard, X-Trail
  "PRADO_LUXURY",       // Prado TX/TXL
  "SAFARI_CRUISER_4X4", // Pop-up roof Land Cruiser
  "TOUR_VAN",           // HiAce Safari Van
  "MINIBUS_14_SEATER",  // High-roof van
  "COASTER_33_SEATER",  // 22-33 seater bus
  "COACH_50_SEATER",    // High-capacity coach
]);

export const legStatusEnum = pgEnum("leg_status", [
  "SCHEDULED",
  "EN_ROUTE",
  "ARRIVED",
  "BOARDED_LOADED",
  "COMPLETED",
]);

export const complianceStatusEnum = pgEnum("compliance_status", [
  "PENDING",
  "APPROVED",
  "SUSPENDED",
]);

export const handoverTypeEnum = pgEnum("handover_type", [
  "DELIVERY",
  "COLLECTION",
]);

export const paymentChannelEnum = pgEnum("payment_channel", [
  "MPESA",
  "BANK_TRANSFER",
  "CASH",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "CONFIRMED",
  "FAILED",
]);

export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "DISPATCHER",
  "PARTNER",
]);
