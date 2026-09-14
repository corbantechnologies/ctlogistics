import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

export async function syncDatabaseSchema() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error("❌ ERROR: DATABASE_URL environment variable is missing.");
    return { error: "DATABASE_URL is missing" };
  }

  const sql = postgres(connectionString, {
    max: 1,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  console.log("⚡ Syncing database schema to PostgreSQL...");

  try {
    // 1. Create Enums if they don't exist
    await sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('ADMIN', 'DISPATCHER', 'PARTNER');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'compliance_status') THEN
          CREATE TYPE compliance_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_category') THEN
          CREATE TYPE vehicle_category AS ENUM (
            'EXECUTIVE_SEDAN',
            'LUXURY_SUV',
            'SAFARI_LAND_CRUISER',
            'TOUR_VAN',
            'VIP_ALPHARD_VELLFIRE',
            'MINI_BUS_COASTER'
          );
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_type') THEN
          CREATE TYPE booking_type AS ENUM (
            'CAR_RENTAL',
            'INTER_COUNTY_TRANSFER',
            'ZONAL_TRANSFER',
            'SAFARI_TOUR',
            'EVENT_CHARTER'
          );
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
          CREATE TYPE booking_status AS ENUM (
            'PENDING',
            'CONFIRMED',
            'DISPATCHED',
            'IN_PROGRESS',
            'COMPLETED',
            'CANCELLED'
          );
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'leg_status') THEN
          CREATE TYPE leg_status AS ENUM (
            'SCHEDULED',
            'EN_ROUTE',
            'ARRIVED',
            'BOARDED_LOADED',
            'COMPLETED',
            'CANCELLED'
          );
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_channel') THEN
          CREATE TYPE payment_channel AS ENUM ('MPESA', 'CARD', 'BANK_TRANSFER', 'CASH');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'handover_type') THEN
          CREATE TYPE handover_type AS ENUM ('COLLECTION', 'RETURN');
        END IF;
      END $$;
    `;

    console.log("✓ Enums verified.");

    // 2. Create Tables
    await sql`
      CREATE TABLE IF NOT EXISTS partners (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_name VARCHAR(255) NOT NULL,
        contact_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        compliance_status compliance_status NOT NULL DEFAULT 'PENDING',
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        hashed_password VARCHAR(255) NOT NULL,
        role user_role NOT NULL DEFAULT 'ADMIN',
        partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
        plate_number VARCHAR(50) NOT NULL UNIQUE,
        make_model VARCHAR(100) NOT NULL,
        year INTEGER,
        color VARCHAR(50),
        category vehicle_category NOT NULL,
        seating_capacity INTEGER NOT NULL,
        daily_rate NUMERIC(12, 2),
        hourly_rate NUMERIC(12, 2),
        features TEXT,
        photos TEXT,
        offered_services TEXT,
        availability_status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
        is_self_drive_eligible BOOLEAN NOT NULL DEFAULT FALSE,
        psv_insurance_expiry TIMESTAMP,
        comprehensive_insurance_expiry TIMESTAMP,
        inspection_expiry TIMESTAMP,
        has_gps_tracker BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS drivers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        license_number VARCHAR(100) NOT NULL,
        license_expiry TIMESTAMP,
        psv_badge_number VARCHAR(100),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS routes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        origin_zone VARCHAR(100) NOT NULL,
        destination_zone VARCHAR(100) NOT NULL,
        distance_km NUMERIC(8, 2),
        estimated_duration_minutes INTEGER,
        vehicle_category vehicle_category NOT NULL,
        buy_rate NUMERIC(12, 2) NOT NULL,
        sell_rate NUMERIC(12, 2) NOT NULL,
        has_tolls BOOLEAN NOT NULL DEFAULT FALSE,
        includes_deadhead_cost BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_group_id VARCHAR(100),
        booking_type booking_type NOT NULL,
        status booking_status NOT NULL DEFAULT 'PENDING',
        access_token VARCHAR(128) NOT NULL UNIQUE,
        client_name VARCHAR(255) NOT NULL,
        client_phone VARCHAR(50) NOT NULL,
        client_email VARCHAR(255),
        client_id_number VARCHAR(100),
        total_sell_amount NUMERIC(12, 2) NOT NULL,
        total_buy_amount NUMERIC(12, 2) NOT NULL,
        security_deposit NUMERIC(12, 2) NOT NULL DEFAULT 0,
        deposit_percentage INTEGER NOT NULL DEFAULT 30,
        is_deposit_paid BOOLEAN NOT NULL DEFAULT FALSE,
        is_full_payment_received BOOLEAN NOT NULL DEFAULT FALSE,
        payment_status VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
        mpesa_checkout_request_id VARCHAR(100),
        mpesa_receipt_number VARCHAR(100),
        rental_start TIMESTAMP,
        rental_end TIMESTAMP,
        delivery_address TEXT,
        collection_address TEXT,
        delivery_fee NUMERIC(12, 2) DEFAULT 0,
        pax_count INTEGER,
        special_requirements TEXT,
        internal_notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS trip_legs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        leg_sequence INTEGER NOT NULL,
        day_number INTEGER NOT NULL DEFAULT 1,
        origin_location TEXT NOT NULL,
        destination_location TEXT NOT NULL,
        scheduled_time TIMESTAMP NOT NULL,
        actual_start_time TIMESTAMP,
        actual_end_time TIMESTAMP,
        status leg_status NOT NULL DEFAULT 'SCHEDULED',
        assigned_asset_id UUID REFERENCES assets(id),
        driver_id UUID REFERENCES drivers(id),
        partner_payout NUMERIC(12, 2) NOT NULL DEFAULT 0,
        driver_daily_allowance NUMERIC(12, 2),
        park_entry_gate VARCHAR(255),
        lodge_drop_point VARCHAR(255),
        handover_token VARCHAR(128) UNIQUE,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        amount NUMERIC(12, 2) NOT NULL,
        channel payment_channel NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
        mpesa_ref VARCHAR(100),
        paid_at TIMESTAMP NOT NULL DEFAULT NOW(),
        recorded_by VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS handovers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        trip_leg_id UUID NOT NULL REFERENCES trip_legs(id) ON DELETE CASCADE,
        handover_type handover_type NOT NULL,
        odometer_reading INTEGER NOT NULL,
        fuel_level_fraction NUMERIC(4, 2) NOT NULL,
        is_clean BOOLEAN NOT NULL DEFAULT TRUE,
        damage_notes TEXT,
        photo_urls TEXT,
        client_signature_url TEXT,
        completed_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires TIMESTAMP NOT NULL,
        PRIMARY KEY (identifier, token)
      );
    `;

    console.log("✅ All PostgreSQL database tables created and verified successfully!");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Failed to sync database schema:", error);
    return { error: error.message || "Failed to sync database schema" };
  } finally {
    await sql.end();
  }
}

// Allow direct execution from CLI (node / tsx db/sync.ts)
if (require.main === module) {
  syncDatabaseSchema().then(() => process.exit(0)).catch(() => process.exit(1));
}
