export type BookingType =
  | "CAR_RENTAL"
  | "INTER_COUNTY_TRANSFER"
  | "ZONAL_TRANSFER"
  | "SAFARI_TOUR"
  | "EVENT_CHARTER";

export type VehicleCategory =
  | "SALOON"
  | "COMPACT_SUV"
  | "PRADO_LUXURY"
  | "SAFARI_CRUISER_4X4"
  | "TOUR_VAN"
  | "MINIBUS_14_SEATER"
  | "COASTER_33_SEATER"
  | "COACH_50_SEATER";

export const VEHICLE_CATEGORY_LABELS: Record<VehicleCategory, string> = {
  SALOON: "Executive Saloon — Premio / Allion / Fielder",
  COMPACT_SUV: "Compact SUV — RAV4 / X-Trail / Vanguard",
  PRADO_LUXURY: "Luxury Prado — TX / TXL",
  SAFARI_CRUISER_4X4: "Safari Land Cruiser — 4x4 Pop-up Roof",
  TOUR_VAN: "Tour Van — HiAce Safari",
  MINIBUS_14_SEATER: "Minibus — 14 Seater High-roof",
  COASTER_33_SEATER: "Coaster — 22–33 Seater",
  COACH_50_SEATER: "Coach — 50 Seater High-capacity",
};

export type QuoteResult = {
  sellRate: number;
  buyRate: number;
  margin: number;
  marginPct: number;
  breakdown: string[];
  routeId?: string;
};

export type Route = {
  id: string;
  name: string;
  originZone: string;
  destinationZone: string;
  estimatedDurationMins: number;
  standardDistanceKm: number;
};
