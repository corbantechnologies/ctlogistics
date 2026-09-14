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
          CREATE TYPE compliance_status AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_category') THEN
          CREATE TYPE vehicle_category AS ENUM (
            'SALOON',
            'COMPACT_SUV',
            'PRADO_LUXURY',
            'SAFARI_CRUISER_4X4',
            'TOUR_VAN',
            'MINIBUS_14_SEATER',
            'COASTER_33_SEATER',
            'COACH_50_SEATER'
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
            'COMPLETED'
          );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'handover_type') THEN
          CREATE TYPE handover_type AS ENUM ('DELIVERY', 'COLLECTION');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_channel') THEN
          CREATE TYPE payment_channel AS ENUM ('MPESA', 'BANK_TRANSFER', 'CASH');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
          CREATE TYPE payment_status AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');
        END IF;
      END $$;
    `;

    // Safely add missing enum values to existing enum types if necessary
    await sql`
      DO $$ BEGIN
        ALTER TYPE vehicle_category ADD VALUE IF NOT EXISTS 'SALOON';
        ALTER TYPE vehicle_category ADD VALUE IF NOT EXISTS 'COMPACT_SUV';
        ALTER TYPE vehicle_category ADD VALUE IF NOT EXISTS 'PRADO_LUXURY';
        ALTER TYPE vehicle_category ADD VALUE IF NOT EXISTS 'SAFARI_CRUISER_4X4';
        ALTER TYPE vehicle_category ADD VALUE IF NOT EXISTS 'MINIBUS_14_SEATER';
        ALTER TYPE vehicle_category ADD VALUE IF NOT EXISTS 'COASTER_33_SEATER';
        ALTER TYPE vehicle_category ADD VALUE IF NOT EXISTS 'COACH_50_SEATER';

        ALTER TYPE handover_type ADD VALUE IF NOT EXISTS 'DELIVERY';
      EXCEPTION WHEN OTHERS THEN NULL;
      END $$;
    `;

    console.log("✓ Enums verified.");

    // 2. Create and Alter Tables (Wrapped in single SQL calls or DO blocks)

    // PARTNERS
    await sql`
      CREATE TABLE IF NOT EXISTS partners (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_name VARCHAR(255) NOT NULL,
        contact_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        compliance_status compliance_status NOT NULL DEFAULT 'PENDING',
        notes TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    await sql`
      DO $$ BEGIN
        ALTER TABLE partners ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
        ALTER TABLE partners ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);
        ALTER TABLE partners ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
        ALTER TABLE partners ADD COLUMN IF NOT EXISTS email VARCHAR(255);
        ALTER TABLE partners ADD COLUMN IF NOT EXISTS compliance_status compliance_status DEFAULT 'PENDING';
        ALTER TABLE partners ADD COLUMN IF NOT EXISTS notes TEXT;
        ALTER TABLE partners ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
        ALTER TABLE partners ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
      END $$;
    `;

    // USERS
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        "emailVerified" TIMESTAMP,
        hashed_password VARCHAR(255) NOT NULL,
        role user_role NOT NULL DEFAULT 'DISPATCHER',
        partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    await sql`
      DO $$ BEGIN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'DISPATCHER';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_id UUID;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
        ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
      END $$;
    `;

    // DRIVERS
    await sql`
      CREATE TABLE IF NOT EXISTS drivers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        license_number VARCHAR(100),
        license_expiry TIMESTAMP,
        photo_url TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    await sql`
      DO $$ BEGIN
        ALTER TABLE drivers ADD COLUMN IF NOT EXISTS partner_id UUID;
        ALTER TABLE drivers ADD COLUMN IF NOT EXISTS name VARCHAR(255);
        ALTER TABLE drivers ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
        ALTER TABLE drivers ADD COLUMN IF NOT EXISTS license_number VARCHAR(100);
        ALTER TABLE drivers ADD COLUMN IF NOT EXISTS license_expiry TIMESTAMP;
        ALTER TABLE drivers ADD COLUMN IF NOT EXISTS photo_url TEXT;
        ALTER TABLE drivers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
        ALTER TABLE drivers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
      END $$;
    `;

    // ASSETS
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
      DO $$ BEGIN
        ALTER TABLE assets ADD COLUMN IF NOT EXISTS partner_id UUID;
        ALTER TABLE assets ADD COLUMN IF NOT EXISTS plate_number VARCHAR(50);
        ALTER TABLE assets ADD COLUMN IF NOT EXISTS make_model VARCHAR(100);
        ALTER TABLE assets ADD COLUMN IF NOT EXISTS year INTEGER;
        ALTER TABLE assets ADD COLUMN IF NOT EXISTS color VARCHAR(50);
        ALTER TABLE assets ADD COLUMN IF NOT EXISTS category vehicle_category;
        ALTER TABLE assets ADD COLUMN IF NOT EXISTS seating_capacity INTEGER;
        ALTER TABLE assets ADD COLUMN IF NOT EXISTS daily_rate NUMERIC(12, 2);
        ALTER TABLE assets ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(12, 2);
        ALTER TABLE assets ADD COLUMN IF NOT EXISTS features TEXT;
        ALTER TABLE assets ADD COLUMN IF NOT EXISTS photos TEXT;
        ALTER TABLE assets ADD COLUMN IF NOT EXISTS offered_services TEXT;
        ALTER TABLE assets ADD COLUMN IF NOT EXISTS availability_status VARCHAR(50) DEFAULT 'AVAILABLE';
        ALTER TABLE assets ADD COLUMN IF NOT EXISTS is_self_drive_eligible BOOLEAN DEFAULT FALSE;
        ALTER TABLE assets ADD COLUMN IF NOT EXISTS psv_insurance_expiry TIMESTAMP;
        ALTER TABLE assets ADD COLUMN IF NOT EXISTS comprehensive_insurance_expiry TIMESTAMP;
        ALTER TABLE assets ADD COLUMN IF NOT EXISTS inspection_expiry TIMESTAMP;
        ALTER TABLE assets ADD COLUMN IF NOT EXISTS has_gps_tracker BOOLEAN DEFAULT FALSE;
        ALTER TABLE assets ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
        ALTER TABLE assets ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
      END $$;
    `;

    // ROUTES
    await sql`
      CREATE TABLE IF NOT EXISTS routes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        origin_zone VARCHAR(150) NOT NULL,
        destination_zone VARCHAR(150) NOT NULL,
        estimated_duration_mins INTEGER NOT NULL,
        standard_distance_km INTEGER NOT NULL,
        tolls_included BOOLEAN NOT NULL DEFAULT FALSE,
        deadhead_included BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    await sql`
      DO $$ BEGIN
        ALTER TABLE routes ADD COLUMN IF NOT EXISTS name VARCHAR(255);
        ALTER TABLE routes ADD COLUMN IF NOT EXISTS origin_zone VARCHAR(150);
        ALTER TABLE routes ADD COLUMN IF NOT EXISTS destination_zone VARCHAR(150);
        ALTER TABLE routes ADD COLUMN IF NOT EXISTS estimated_duration_mins INTEGER;
        ALTER TABLE routes ADD COLUMN IF NOT EXISTS standard_distance_km INTEGER;
        ALTER TABLE routes ADD COLUMN IF NOT EXISTS tolls_included BOOLEAN DEFAULT FALSE;
        ALTER TABLE routes ADD COLUMN IF NOT EXISTS deadhead_included BOOLEAN DEFAULT FALSE;
        ALTER TABLE routes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
        ALTER TABLE routes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
      END $$;
    `;

    // ROUTE RATE CARDS
    await sql`
      CREATE TABLE IF NOT EXISTS route_rate_cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
        vehicle_category vehicle_category NOT NULL,
        default_buy_rate NUMERIC(12, 2) NOT NULL,
        retail_sell_rate NUMERIC(12, 2) NOT NULL,
        valid_from TIMESTAMP,
        valid_until TIMESTAMP,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    await sql`
      DO $$ BEGIN
        ALTER TABLE route_rate_cards ADD COLUMN IF NOT EXISTS route_id UUID;
        ALTER TABLE route_rate_cards ADD COLUMN IF NOT EXISTS vehicle_category vehicle_category;
        ALTER TABLE route_rate_cards ADD COLUMN IF NOT EXISTS default_buy_rate NUMERIC(12, 2);
        ALTER TABLE route_rate_cards ADD COLUMN IF NOT EXISTS retail_sell_rate NUMERIC(12, 2);
        ALTER TABLE route_rate_cards ADD COLUMN IF NOT EXISTS valid_from TIMESTAMP;
        ALTER TABLE route_rate_cards ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP;
        ALTER TABLE route_rate_cards ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
        ALTER TABLE route_rate_cards ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
        ALTER TABLE route_rate_cards ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
      END $$;
    `;

    // BOOKINGS
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
      DO $$ BEGIN
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_group_id VARCHAR(100);
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_type booking_type;
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status booking_status DEFAULT 'PENDING';
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS access_token VARCHAR(128);
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_phone VARCHAR(50);
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_email VARCHAR(255);
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_id_number VARCHAR(100);
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_sell_amount NUMERIC(12, 2);
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_buy_amount NUMERIC(12, 2);
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS security_deposit NUMERIC(12, 2) DEFAULT 0;
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_percentage INTEGER DEFAULT 30;
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_deposit_paid BOOLEAN DEFAULT FALSE;
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_full_payment_received BOOLEAN DEFAULT FALSE;
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'UNPAID';
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS mpesa_checkout_request_id VARCHAR(100);
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS mpesa_receipt_number VARCHAR(100);
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rental_start TIMESTAMP;
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rental_end TIMESTAMP;
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS delivery_address TEXT;
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS collection_address TEXT;
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(12, 2) DEFAULT 0;
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pax_count INTEGER;
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_requirements TEXT;
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS internal_notes TEXT;
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
      END $$;
    `;

    // TRIP LEGS
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
      DO $$ BEGIN
        ALTER TABLE trip_legs ADD COLUMN IF NOT EXISTS booking_id UUID;
        ALTER TABLE trip_legs ADD COLUMN IF NOT EXISTS leg_sequence INTEGER;
        ALTER TABLE trip_legs ADD COLUMN IF NOT EXISTS day_number INTEGER DEFAULT 1;
        ALTER TABLE trip_legs ADD COLUMN IF NOT EXISTS origin_location TEXT;
        ALTER TABLE trip_legs ADD COLUMN IF NOT EXISTS destination_location TEXT;
        ALTER TABLE trip_legs ADD COLUMN IF NOT EXISTS scheduled_time TIMESTAMP;
        ALTER TABLE trip_legs ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMP;
        ALTER TABLE trip_legs ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMP;
        ALTER TABLE trip_legs ADD COLUMN IF NOT EXISTS status leg_status DEFAULT 'SCHEDULED';
        ALTER TABLE trip_legs ADD COLUMN IF NOT EXISTS assigned_asset_id UUID;
        ALTER TABLE trip_legs ADD COLUMN IF NOT EXISTS driver_id UUID;
        ALTER TABLE trip_legs ADD COLUMN IF NOT EXISTS partner_payout NUMERIC(12, 2) DEFAULT 0;
        ALTER TABLE trip_legs ADD COLUMN IF NOT EXISTS driver_daily_allowance NUMERIC(12, 2);
        ALTER TABLE trip_legs ADD COLUMN IF NOT EXISTS park_entry_gate VARCHAR(255);
        ALTER TABLE trip_legs ADD COLUMN IF NOT EXISTS lodge_drop_point VARCHAR(255);
        ALTER TABLE trip_legs ADD COLUMN IF NOT EXISTS handover_token VARCHAR(128);
        ALTER TABLE trip_legs ADD COLUMN IF NOT EXISTS notes TEXT;
        ALTER TABLE trip_legs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
      END $$;
    `;

    // PAYMENTS
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        amount NUMERIC(12, 2) NOT NULL,
        channel payment_channel NOT NULL,
        status payment_status NOT NULL DEFAULT 'PENDING',
        mpesa_ref VARCHAR(100),
        paid_at TIMESTAMP,
        recorded_by VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    await sql`
      DO $$ BEGIN
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS booking_id UUID;
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS amount NUMERIC(12, 2);
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS channel payment_channel;
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS status payment_status DEFAULT 'PENDING';
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS mpesa_ref VARCHAR(100);
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS recorded_by VARCHAR(255);
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
      END $$;
    `;

    // HANDOVERS
    await sql`
      CREATE TABLE IF NOT EXISTS handovers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        trip_leg_id UUID REFERENCES trip_legs(id),
        handover_type handover_type NOT NULL,
        runner_name VARCHAR(255) NOT NULL,
        runner_phone VARCHAR(50) NOT NULL,
        odometer_reading INTEGER NOT NULL,
        fuel_level VARCHAR(20) NOT NULL,
        photo_urls JSONB NOT NULL,
        damage_notes TEXT,
        client_signature_url TEXT NOT NULL,
        completed_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    await sql`
      DO $$ BEGIN
        ALTER TABLE handovers ADD COLUMN IF NOT EXISTS booking_id UUID;
        ALTER TABLE handovers ADD COLUMN IF NOT EXISTS trip_leg_id UUID;
        ALTER TABLE handovers ADD COLUMN IF NOT EXISTS handover_type handover_type;
        ALTER TABLE handovers ADD COLUMN IF NOT EXISTS runner_name VARCHAR(255);
        ALTER TABLE handovers ADD COLUMN IF NOT EXISTS runner_phone VARCHAR(50);
        ALTER TABLE handovers ADD COLUMN IF NOT EXISTS odometer_reading INTEGER;
        ALTER TABLE handovers ADD COLUMN IF NOT EXISTS fuel_level VARCHAR(20);
        ALTER TABLE handovers ADD COLUMN IF NOT EXISTS photo_urls JSONB;
        ALTER TABLE handovers ADD COLUMN IF NOT EXISTS damage_notes TEXT;
        ALTER TABLE handovers ADD COLUMN IF NOT EXISTS client_signature_url TEXT;
        ALTER TABLE handovers ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP DEFAULT NOW();
      END $$;
    `;

    // VERIFICATION TOKENS
    await sql`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
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

// Allow direct execution from CLI safely without ReferenceError in Webpack / Next.js
if (typeof require !== "undefined" && typeof module !== "undefined" && require.main === module) {
  syncDatabaseSchema().then(() => process.exit(0)).catch(() => process.exit(1));
}
