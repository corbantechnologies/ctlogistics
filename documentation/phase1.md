# Phase 1: Technical & Product Specification

## Project: Asset-Light Logistics & Orchestration Engine

---

## 1. System Vision & Business Position

The platform operates as a **pure technology orchestrator and logistics broker**, not a traditional asset-heavy logistics firm. It bridges customer demand with vetted third-party capacity across three active business verticals without holding vehicle inventory on the company balance sheet.

```
                              ┌───────────────────────────────────┐
                              │         Unified Booking Core      │
                              └─────────────────┬─────────────────┘
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 ▼                              ▼                              ▼
  ┌──────────────────────────────┐┌──────────────────────────────┐┌──────────────────────────────┐
  │   Car Rental (Self-Drive)    ││ Long-Distance / Inter-County ││ Tours & Multi-Day Safaris    │
  ├──────────────────────────────┤├──────────────────────────────┤├──────────────────────────────┤
  │ • Delivery & Collection Pins ││ • Corridor & Zonal Engine    ││ • Circuit Itinerary Builder  │
  │ • Security Deposit Flow      ││ • Deadhead Return Inclusion  ││ • Guide & Vehicle Add-ons    │
  │ • Digital Inspection Scans   ││ • Expressway & Toll Buffers  ││ • Staged Multi-Day Manifests │
  └──────────────────────────────┘└──────────────────────────────┘└──────────────────────────────┘
```

### Core Business Pillars

- **Decoupled Pricing Model:** Wholesale Buy Rate ($$   \text{COGS}   $$ set by partners) is isolated from Retail Sell Rate (set by platform admin), locking in a predictable $20\text{--}35\%$ gross profit margin.
- **Liability Insulation:** Terms classify the company as a digital coordination facilitator. Direct liability rests on third-party commercial PSV/comprehensive insurance and tri-party digital agreements.
- **Progressive Access:** Public users book instantly via zero-login guest flows and interact via cryptographic **Magic Links** (`/track/[token]`, `/handover/[token]`). Authenticated workspaces are reserved for dispatchers and fleet administrators.

---

## 2. User Roles & Interaction Matrix

| User Role                  | Access Mode                  | Primary Identifier          | Core Capabilities & Workflows |
|---------------------------|------------------------------|-----------------------------|-------------------------------|
| **1. The Client / Guest** | **No-Login / Magic Link**   | Phone (WhatsApp) + Email   | • Instant quotes across vehicle tiers<br>• Tokenized tracking card (`/track/[token]`)<br>• Digital rental agreement sign-off and receipt generation |
| **2. The Admin / Dispatcher** | **Authenticated Portal** | Work Email + Auth Session  | • Centralized dispatch watchtower<br>• Rate card and corridor margin controls<br>• Manual/broadcast partner dispatch & exception handling |
| **3. The Fleet Partner**  | **Partner Portal / WhatsApp** | Phone / Corporate Profile | • Vehicle inventory and documentation management<br>• Wholesale rate card (COGS) registration<br>• Job broadcast acceptance and driver assignment |
| **4. The Driver / Runner**| **Tokenized Mobile Link**   | Mobile URL (`/handover/...`) | • Route milestones (`En Route`, `Passenger Onboard`)<br>• 4-side vehicle inspection photo uploads<br>• Odometer, fuel level capture, and client signature sign-off |

---

## 3. Detailed Module Specifications

### Module A: Self-Drive Car Rental (Delivery & Collection Logistics)

Designed for clients requiring vehicle drop-off at their location (e.g., hotel, private residence, airport) and retrieval at the end of the rental term.

- **Booking Mechanics:**
  - Client selects dates, times, vehicle category (e.g., Compact Hatch, Executive Saloon, Mid-Size SUV), and toggles **"Deliver to my location"**.
  - Dynamic flat/distance-based delivery and collection fees are calculated automatically.
  - Captures client identification (ID/Passport, Valid Driving License) upfront.

- **The Handover Protocol (`/handover/[token]`):**
  - Runner arrives at delivery pin and opens the mobile token URL.
  - Takes 4 mandatory exterior photos (Front, Back, Left, Right) + 1 interior photo.
  - Records fuel level ($1/4$, $1/2$, $3/4$, $$   \text{Full}   $$) and current odometer reading.
  - Client reviews pre-existing scratch tags, accepts digital terms, and signs on-screen.

- **Collection & Deposit Release:**
  - Runner completes return inspection at the pickup pin.
  - Any excess mileage or missing fuel is flagged against the held security deposit.

---

### Module B: Long-Distance & Inter-County Private Transfers

Handles long-haul highway corridors (e.g., Mombasa $$   \leftrightarrow   $$ Nairobi) and localized zonal transfers (e.g., Moi Airport $$   \leftrightarrow   $$ Diani/Nyali).

- **Corridor vs. Dynamic Calculation:**
  - **Corridors:** Predefined fixed routes with deadhead (empty return trip) allowances, driver return transport, and highway/expressway tolls built into the base retail price.
  - **Off-Route Fallback:** Distance ($$   \text{km}   $$) $$   \times   $$ Tier Per-Km Rate $$   +   $$ Return Leg Multiplier ($1.5\times$ or $2\times$).

- **Vehicle Tier Allocation:**
  - Client books a **Category Tier** (e.g., *Executive Saloon: Premio/Allion/Fielder or equivalent*), never a specific registration number, preventing partner availability bottlenecks.

- **Operational Flow:**
  - Booking confirmation generates a `/track/[token]` link.
  - Dispatcher broadcasts to approved corridor partners. Partner accepts and binds an asset/driver.
  - Client receives driver profile, vehicle plate, and live status updates over WhatsApp.

---

### Module C: Tours, Safaris & Multi-Day Charters

Accommodates single-day excursions, bush safaris (e.g., Tsavo, Amboseli, Maasai Mara), and high-capacity multi-vehicle events (e.g., destination weddings for 200–300 pax).

- **Itinerary & Leg Engine:**
  - Builds segmented multi-day manifests (`Day 1: JKIA -> Naivasha`, `Day 2: Naivasha -> Mara`, etc.).
  - Tracks driver daily allowances, park entry gates, and lodge drop points per leg.

- **Multi-Vehicle Event Grouping:**
  - Multiple individual vehicle allocations (buses, coasters, safari cruisers, executive sedans) tie back to a single `event_group_id`.
  - Master billing manifest aggregates all partner buy costs and generates a unified corporate invoice.

- **Staged Payment & Escrow Workflow:**
  - **Deposit:** $30\text{--}50\%$ advance to confirm booking and lock high-demand partner fleet.
  - **Balance:** Remaining balance cleared 48 hours prior to vehicle departure.
  - **Partner Settlement:** Released 24 hours post-execution upon manifest verification.

---

## 4. Technical Architecture: Next.js + Drizzle ORM + PostgreSQL

### System Layout - it does not necessarily have to be like below. I understand each user has their own dashboards

```
src/
├── app/
│   ├── (public)/                    # No-login client flows
│   │   ├── page.tsx                 # Modular instant quote & booking form
│   │   ├── track/[token]/          # Guest live tracking & itinerary view
│   │   └── handover/[token]/       # Runner inspection, photo upload & signature
│   ├── (dashboard)/                 # Authenticated dispatch & management
│   │   ├── dispatch/                # Live operations queue & broadcast tool
│   │   ├── routes/                  # Corridor definition & pricing matrices
│   │   ├── fleet/                   # Partner vetting, documents & assets
│   │   └── events/                  # Multi-vehicle event group planner
│   └── api/
│       ├── webhooks/                # WhatsApp/SMS notification triggers
│       └── uploads/                 # Pre-signed storage upload endpoints
├── db/
│   ├── schema/                      # Drizzle schema definitions
│   │   ├── assets.ts                # Partner fleet registry
│   │   ├── routes.ts                # Corridors, zones, and rate cards
│   │   ├── bookings.ts              # Master orders & tokens
│   │   ├── trip-legs.ts             # Step-by-step route legs & manifests
│   │   └── handovers.ts             # Digital inspection & condition logs
│   └── index.ts                     # Drizzle database client instance
└── lib/
    ├── pricing.ts                   # Corridor & daily rate calculation utilities
    └── notifications.ts             # WhatsApp & SMS notification dispatches
```

---

## 5. Drizzle Database Schema Blueprint: just a sample

```typescript
import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";

// Enums
export const bookingTypeEnum = pgEnum("booking_type", [
  "CAR_RENTAL",
  "INTER_COUNTY_TRANSFER",
  "ZONAL_TRANSFER",
  "SAFARI_TOUR",
  "EVENT_CHARTER"
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "PENDING",
  "CONFIRMED",
  "DISPATCHED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED"
]);

export const vehicleCategoryEnum = pgEnum("vehicle_category", [
  "SALOON",            // Premio, Allion, Fielder
  "COMPACT_SUV",       // RAV4, Vanguard, X-Trail
  "PRADO_LUXURY",      // Prado TX/TXL
  "SAFARI_CRUISER_4X4",// Pop-up roof land cruiser
  "TOUR_VAN",          // HiAce Safari Van
  "MINIBUS_14_SEATER", // High-roof van
  "COASTER_33_SEATER", // 22-33 seater bus
  "COACH_50_SEATER"    // High-capacity coach
]);

export const legStatusEnum = pgEnum("leg_status", [
  "SCHEDULED",
  "EN_ROUTE",
  "ARRIVED",
  "BOARDED_LOADED",
  "COMPLETED"
]);

// 1. Partners & Assets
export const partners = pgTable("partners", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  complianceStatus: varchar("compliance_status", { length: 50 }).default("PENDING").notNull(), // PENDING, APPROVED, SUSPENDED
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  partnerId: uuid("partner_id").references(() => partners.id),
  plateNumber: varchar("plate_number", { length: 50 }).notNull().unique(),
  makeModel: varchar("make_model", { length: 100 }).notNull(),
  category: vehicleCategoryEnum("category").notNull(),
  seatingCapacity: integer("seating_capacity").notNull(),
  isSelfDriveEligible: boolean("is_self_drive_eligible").default(false).notNull(),
  psvInsuranceExpiry: timestamp("psv_insurance_expiry"),
  inspectionExpiry: timestamp("inspection_expiry"),
  hasGpsTracker: boolean("has_gps_tracker").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Corridors & Pricing
export const routes = pgTable("routes", {
  id: uuid("id").defaultRandom().primaryKey(),
  originZone: varchar("origin_zone", { length: 150 }).notNull(),
  destinationZone: varchar("destination_zone", { length: 150 }).notNull(),
  estimatedDurationMins: integer("estimated_duration_mins").notNull(),
  standardDistanceKm: integer("standard_distance_km").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const routeRateCards = pgTable("route_rate_cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  routeId: uuid("route_id").references(() => routes.id).notNull(),
  vehicleCategory: vehicleCategoryEnum("vehicle_category").notNull(),
  defaultBuyRate: integer("default_buy_rate").notNull(), // Partner COGS in KES
  retailSellRate: integer("retail_sell_rate").notNull(), // Client price in KES
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. Master Bookings & Event Groups
export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventGroupId: varchar("event_group_id", { length: 100 }), // Groups multi-vehicle event charters
  bookingType: bookingTypeEnum("booking_type").notNull(),
  status: bookingStatusEnum("status").default("PENDING").notNull(),
  accessToken: varchar("access_token", { length: 128 }).notNull().unique(), // Magic link key

  // Client Details
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientPhone: varchar("client_phone", { length: 50 }).notNull(),
  clientEmail: varchar("client_email", { length: 255 }),

  // Financial Snapshot
  totalSellAmount: integer("total_sell_amount").notNull(),
  totalBuyAmount: integer("total_buy_amount").notNull(), // Total locked COGS
  securityDeposit: integer("security_deposit").default(0).notNull(),
  isDepositPaid: boolean("is_deposit_paid").default(false).notNull(),
  isFullPaymentReceived: boolean("is_full_payment_received").default(false).notNull(),

  // Rental Specific
  rentalStart: timestamp("rental_start"),
  rentalEnd: timestamp("rental_end"),
  deliveryAddress: text("delivery_address"),
  collectionAddress: text("collection_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Trip Legs & Route Manifests
export const tripLegs = pgTable("trip_legs", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").references(() => bookings.id).notNull(),
  legSequence: integer("leg_sequence").notNull(), // 1, 2, 3...
  originLocation: text("origin_location").notNull(),
  destinationLocation: text("destination_location").notNull(),
  scheduledTime: timestamp("scheduled_time").notNull(),
  actualStartTime: timestamp("actual_end_time"),
  actualEndTime: timestamp("actual_end_time"),
  status: legStatusEnum("status").default("SCHEDULED").notNull(),

  // Asset & Driver Assignment
  assignedAssetId: uuid("assigned_asset_id").references(() => assets.id),
  driverName: varchar("driver_name", { length: 255 }),
  driverPhone: varchar("driver_phone", { length: 50 }),
  partnerPayout: integer("partner_payout").notNull(),
});

// 5. Digital Inspections & Handovers
export const handovers = pgTable("handovers", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").references(() => bookings.id).notNull(),
  tripLegId: uuid("trip_leg_id").references(() => tripLegs.id),
  handoverType: varchar("handover_type", { length: 50 }).notNull(), // 'DELIVERY' or 'COLLECTION'
  odometerReading: integer("odometer_reading").notNull(),
  fuelLevel: varchar("fuel_level", { length: 20 }).notNull(), // '1/4', '1/2', '3/4', 'FULL'
  photoUrls: jsonb("photo_urls").notNull(), // ["url1", "url2", "url3", "url4"]
  damageNotes: text("damage_notes"),
  clientSignatureUrl: text("client_signature_url").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});
```

---

## 6. Implementation Milestones

```
Sprint 1: Schema, Rate Cards & Instant Quotes ──► Sprint 2: Magic Links & Handover Forms ──► Sprint 3: Watchtower & Events
```

- **Sprint 1: Core Engine & Quote Interface**
  - Set up PostgreSQL connection with Drizzle migrations using the schema above.
  - Seed corridor data (Mombasa $$   \leftrightarrow   $$ Nairobi, Diani, Malindi, Tsavo) and initial rate cards.
  - Build public quote calculation forms for Self-Drive Rental and Corridor Transfers.
  - Implement unauthenticated guest checkout generating the persistent `access_token`.

- **Sprint 2: Magic Links & Digital Inspection Module**
  - Construct `/track/[token]` server-rendered tracking view for trip status and driver assignment cards.
  - Construct `/handover/[token]` mobile inspection interface for delivery runners (photo uploads, fuel/odometer inputs, canvas signature capture).
  - Wire storage upload actions for vehicle condition images.
  - Connect WhatsApp/SMS outbound webhook triggers.

- **Sprint 3: Dispatcher Watchtower & Group Allocations**
  - Build authenticated `/dashboard/dispatch` interface to review incoming unassigned bookings.
  - Implement partner assignment interface with automated gross margin calculations.
  - Build the `event_group_id` module to schedule multi-vehicle fleets for group charters.
  - Deploy end-to-end integration on live corridor and rental pilot requests.