CREATE TYPE "public"."booking_status" AS ENUM('PENDING', 'CONFIRMED', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."booking_type" AS ENUM('CAR_RENTAL', 'INTER_COUNTY_TRANSFER', 'ZONAL_TRANSFER', 'SAFARI_TOUR', 'EVENT_CHARTER');--> statement-breakpoint
CREATE TYPE "public"."compliance_status" AS ENUM('PENDING', 'APPROVED', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."handover_type" AS ENUM('DELIVERY', 'COLLECTION');--> statement-breakpoint
CREATE TYPE "public"."leg_status" AS ENUM('SCHEDULED', 'EN_ROUTE', 'ARRIVED', 'BOARDED_LOADED', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."payment_channel" AS ENUM('MPESA', 'BANK_TRANSFER', 'CASH');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'CONFIRMED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'DISPATCHER');--> statement-breakpoint
CREATE TYPE "public"."vehicle_category" AS ENUM('SALOON', 'COMPACT_SUV', 'PRADO_LUXURY', 'SAFARI_CRUISER_4X4', 'TOUR_VAN', 'MINIBUS_14_SEATER', 'COASTER_33_SEATER', 'COACH_50_SEATER');--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"license_number" varchar(100),
	"license_expiry" timestamp,
	"photo_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"contact_name" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"email" varchar(255),
	"compliance_status" "compliance_status" DEFAULT 'PENDING' NOT NULL,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"plate_number" varchar(50) NOT NULL,
	"make_model" varchar(100) NOT NULL,
	"year" integer,
	"color" varchar(50),
	"category" "vehicle_category" NOT NULL,
	"seating_capacity" integer NOT NULL,
	"is_self_drive_eligible" boolean DEFAULT false NOT NULL,
	"psv_insurance_expiry" timestamp,
	"comprehensive_insurance_expiry" timestamp,
	"inspection_expiry" timestamp,
	"has_gps_tracker" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "assets_plate_number_unique" UNIQUE("plate_number")
);
--> statement-breakpoint
CREATE TABLE "route_rate_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_id" uuid NOT NULL,
	"vehicle_category" "vehicle_category" NOT NULL,
	"default_buy_rate" numeric(12, 2) NOT NULL,
	"retail_sell_rate" numeric(12, 2) NOT NULL,
	"valid_from" timestamp,
	"valid_until" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"origin_zone" varchar(150) NOT NULL,
	"destination_zone" varchar(150) NOT NULL,
	"estimated_duration_mins" integer NOT NULL,
	"standard_distance_km" integer NOT NULL,
	"tolls_included" boolean DEFAULT false NOT NULL,
	"deadhead_included" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_group_id" varchar(100),
	"booking_type" "booking_type" NOT NULL,
	"status" "booking_status" DEFAULT 'PENDING' NOT NULL,
	"access_token" varchar(128) NOT NULL,
	"client_name" varchar(255) NOT NULL,
	"client_phone" varchar(50) NOT NULL,
	"client_email" varchar(255),
	"client_id_number" varchar(100),
	"total_sell_amount" numeric(12, 2) NOT NULL,
	"total_buy_amount" numeric(12, 2) NOT NULL,
	"security_deposit" numeric(12, 2) DEFAULT '0' NOT NULL,
	"is_deposit_paid" boolean DEFAULT false NOT NULL,
	"is_full_payment_received" boolean DEFAULT false NOT NULL,
	"rental_start" timestamp,
	"rental_end" timestamp,
	"delivery_address" text,
	"collection_address" text,
	"delivery_fee" numeric(12, 2) DEFAULT '0',
	"pax_count" integer,
	"special_requirements" text,
	"internal_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_access_token_unique" UNIQUE("access_token")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"channel" "payment_channel" NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"mpesa_ref" varchar(100),
	"paid_at" timestamp,
	"recorded_by" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_legs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"leg_sequence" integer NOT NULL,
	"origin_location" text NOT NULL,
	"destination_location" text NOT NULL,
	"scheduled_time" timestamp NOT NULL,
	"actual_start_time" timestamp,
	"actual_end_time" timestamp,
	"status" "leg_status" DEFAULT 'SCHEDULED' NOT NULL,
	"assigned_asset_id" uuid,
	"driver_id" uuid,
	"partner_payout" numeric(12, 2) DEFAULT '0' NOT NULL,
	"driver_daily_allowance" numeric(12, 2),
	"park_entry_gate" varchar(255),
	"lodge_drop_point" varchar(255),
	"handover_token" varchar(128),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "trip_legs_handover_token_unique" UNIQUE("handover_token")
);
--> statement-breakpoint
CREATE TABLE "handovers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"trip_leg_id" uuid,
	"handover_type" "handover_type" NOT NULL,
	"runner_name" varchar(255) NOT NULL,
	"runner_phone" varchar(50) NOT NULL,
	"odometer_reading" integer NOT NULL,
	"fuel_level" varchar(20) NOT NULL,
	"photo_urls" jsonb NOT NULL,
	"damage_notes" text,
	"client_signature_url" text NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'DISPATCHER' NOT NULL,
	"hashed_password" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "partner_sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"hashed_password" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partner_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_rate_cards" ADD CONSTRAINT "route_rate_cards_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_legs" ADD CONSTRAINT "trip_legs_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_legs" ADD CONSTRAINT "trip_legs_assigned_asset_id_assets_id_fk" FOREIGN KEY ("assigned_asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_legs" ADD CONSTRAINT "trip_legs_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "handovers" ADD CONSTRAINT "handovers_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "handovers" ADD CONSTRAINT "handovers_trip_leg_id_trip_legs_id_fk" FOREIGN KEY ("trip_leg_id") REFERENCES "public"."trip_legs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_sessions" ADD CONSTRAINT "partner_sessions_user_id_partner_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."partner_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_users" ADD CONSTRAINT "partner_users_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;