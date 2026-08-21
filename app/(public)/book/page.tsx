"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ServiceSelector } from "../_components/ServiceSelector";
import { RentalStep } from "../_components/RentalStep";
import { TransferStep } from "../_components/TransferStep";
import { SafariStep } from "../_components/SafariStep";
import { QuoteCard } from "../_components/QuoteCard";
import { ClientDetailsStep } from "../_components/ClientDetailsStep";
import type { BookingType, QuoteResult, Route } from "../_components/types";
import type { RentalData } from "../_components/RentalStep";
import type { TransferData } from "../_components/TransferStep";
import type { SafariData } from "../_components/SafariStep";
import type { ClientData } from "../_components/ClientDetailsStep";
import {
  createRentalBooking,
  createTransferBooking,
  createSafariBooking,
  getQuotePreview,
} from "@/app/actions/bookings";

type WizardStep = "service" | "details" | "quote" | "contact";

// Routes are fetched server-side and passed to the page.
// For the client component, we'll use a simplified inline approach.
const MOCK_ROUTES: Route[] = [
  { id: "route-msa-nbo", name: "Mombasa → Nairobi", originZone: "Mombasa CBD", destinationZone: "Nairobi CBD", estimatedDurationMins: 480, standardDistanceKm: 490 },
  { id: "route-msa-diani", name: "Mombasa → Diani", originZone: "Mombasa CBD", destinationZone: "Diani / Ukunda", estimatedDurationMins: 60, standardDistanceKm: 40 },
  { id: "route-msa-malindi", name: "Mombasa → Malindi", originZone: "Mombasa CBD", destinationZone: "Malindi", estimatedDurationMins: 120, standardDistanceKm: 120 },
  { id: "route-msa-tsavo", name: "Mombasa → Tsavo", originZone: "Mombasa CBD", destinationZone: "Voi / Tsavo East Gate", estimatedDurationMins: 150, standardDistanceKm: 160 },
  { id: "route-nbo-amboseli", name: "Nairobi → Amboseli", originZone: "Nairobi CBD / JKIA", destinationZone: "Amboseli National Park", estimatedDurationMins: 240, standardDistanceKm: 230 },
  { id: "route-nbo-mara", name: "Nairobi → Maasai Mara", originZone: "Nairobi CBD / JKIA", destinationZone: "Maasai Mara (Sekenani Gate)", estimatedDurationMins: 300, standardDistanceKm: 280 },
];

const STEP_LABELS: WizardStep[] = ["service", "details", "quote", "contact"];
const STEP_NUMBERS: Record<WizardStep, number> = { service: 1, details: 2, quote: 3, contact: 4 };

export default function BookingPage() {
  const [step, setStep] = useState<WizardStep>("service");
  const [serviceType, setServiceType] = useState<BookingType | null>(null);
  const [serviceData, setServiceData] = useState<RentalData | TransferData | SafariData | null>(null);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleServiceSelect(type: BookingType) {
    setServiceType(type);
    setStep("details");
  }

  async function handleServiceDataNext(data: RentalData | TransferData | SafariData) {
    setServiceData(data);
    setQuoteLoading(true);
    setStep("quote");

    // Build FormData for the server action quote preview
    const fd = new FormData();
    if ("days" in data) {
      fd.set("type", "CAR_RENTAL");
      fd.set("vehicleCategory", data.vehicleCategory);
      fd.set("days", String(data.days));
      fd.set("deliveryDistanceKm", String(data.deliveryDistanceKm ?? 0));
    } else {
      fd.set("type", "bookingType" in data ? data.bookingType : "INTER_COUNTY_TRANSFER");
      fd.set("vehicleCategory", data.vehicleCategory);
      if ("routeId" in data && data.routeId) fd.set("routeId", data.routeId);
      if ("distanceKm" in data && data.distanceKm) fd.set("distanceKm", String(data.distanceKm));
    }

    try {
      const result = await getQuotePreview(fd);
      setQuote(result);
    } catch {
      setQuote({ sellRate: 0, buyRate: 0, margin: 0, marginPct: 0, breakdown: ["Quote unavailable — admin will confirm"] });
    } finally {
      setQuoteLoading(false);
    }
  }

  function handleQuoteAccept() {
    setStep("contact");
  }

  function handleContactSubmit(clientData: ClientData) {
    if (!serviceData || !serviceType) return;

    const fd = new FormData();
    fd.set("clientName", clientData.clientName);
    fd.set("clientPhone", clientData.clientPhone);
    fd.set("clientEmail", clientData.clientEmail);
    fd.set("clientIdNumber", clientData.clientIdNumber);

    if (serviceType === "CAR_RENTAL") {
      const d = serviceData as RentalData;
      fd.set("bookingType", "CAR_RENTAL");
      fd.set("vehicleCategory", d.vehicleCategory);
      fd.set("rentalStart", d.rentalStart);
      fd.set("rentalEnd", d.rentalEnd);
      fd.set("deliverToLocation", String(d.deliverToLocation));
      if (d.deliveryAddress) fd.set("deliveryAddress", d.deliveryAddress);
      if (d.collectionAddress) fd.set("collectionAddress", d.collectionAddress);
      fd.set("deliveryDistanceKm", String(d.deliveryDistanceKm ?? 0));
      startTransition(async () => { await createRentalBooking(fd); });
    } else if (serviceType === "SAFARI_TOUR" || serviceType === "EVENT_CHARTER") {
      const d = serviceData as SafariData;
      fd.set("bookingType", d.bookingType);
      fd.set("vehicleCategory", d.vehicleCategory);
      if (d.routeId) fd.set("routeId", d.routeId);
      fd.set("originLocation", d.originLocation);
      fd.set("destinationLocation", d.destinationLocation);
      fd.set("scheduledTime", d.scheduledTime);
      fd.set("paxCount", String(d.paxCount));
      fd.set("specialRequirements", d.specialRequirements);
      startTransition(async () => { await createSafariBooking(fd); });
    } else {
      const d = serviceData as TransferData;
      fd.set("bookingType", d.bookingType);
      fd.set("vehicleCategory", d.vehicleCategory);
      if (d.routeId) fd.set("routeId", d.routeId);
      fd.set("originLocation", d.originLocation);
      fd.set("destinationLocation", d.destinationLocation);
      fd.set("scheduledTime", d.scheduledTime);
      if (d.distanceKm) fd.set("distanceKm", String(d.distanceKm));
      fd.set("returnMultiplier", String(d.returnMultiplier));
      startTransition(async () => { await createTransferBooking(fd); });
    }
  }

  const currentStepNum = STEP_NUMBERS[step];

  return (
    <div className="min-h-dvh relative overflow-hidden">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-20 h-[500px] w-[500px] rounded-full bg-blue-900/20 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[800px] rounded-full bg-amber-900/5 blur-[80px]" />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-400 flex items-center justify-center">
              <span className="text-black font-black text-xs">CT</span>
            </div>
            <span className="font-bold text-white tracking-tight">CT Drive</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-white/50">
          </nav>
        </header>

        {/* Hero */}
        {step === "service" && (
          <div className="px-6 pt-14 pb-8 text-center">
            <span className="badge badge-confirmed mb-4 inline-flex">🚀 Instant Quotes · No Account Needed</span>
            <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight">
              Kenya&apos;s Smartest<br />
              <span className="text-amber-400">Transport Platform</span>
            </h1>
            <p className="mt-4 text-lg text-white/50 max-w-lg mx-auto">
              Car rentals, private transfers and safari tours — quoted and booked in under 2 minutes.
            </p>
          </div>
        )}

        {/* Progress bar */}
        {step !== "service" && (
          <div className="px-6 pt-8 pb-2">
            <div className="max-w-xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                {[1,2,3,4].map((n) => (
                  <div key={n} className="flex-1 flex items-center gap-2">
                    <div className={`h-1.5 w-full rounded-full transition-all duration-300 ${n <= currentStepNum ? "bg-amber-400" : "bg-white/10"}`} />
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/40">
                Step {currentStepNum} of 4
              </p>
            </div>
          </div>
        )}

        {/* Wizard content */}
        <main className="flex-1 px-6 py-8">
          <div className="max-w-xl mx-auto">
            <div className="animate-in">
              {step === "service" && (
                <ServiceSelector selected={serviceType} onSelect={handleServiceSelect} />
              )}

              {step === "details" && serviceType === "CAR_RENTAL" && (
                <RentalStep onNext={handleServiceDataNext} />
              )}

              {step === "details" && (serviceType === "INTER_COUNTY_TRANSFER" || serviceType === "ZONAL_TRANSFER") && (
                <TransferStep routes={MOCK_ROUTES} onNext={handleServiceDataNext} />
              )}

              {step === "details" && (serviceType === "SAFARI_TOUR" || serviceType === "EVENT_CHARTER") && (
                <SafariStep routes={MOCK_ROUTES} onNext={handleServiceDataNext} />
              )}

              {step === "quote" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Your Quote</h2>
                    <p className="text-white/50 text-sm mt-1">Review the pricing before confirming</p>
                  </div>
                  <QuoteCard quote={quote!} isLoading={quoteLoading} />
                  <div className="flex gap-3">
                    <button onClick={() => setStep("details")} className="btn-ghost flex-1">
                      ← Adjust
                    </button>
                    <button
                      onClick={handleQuoteAccept}
                      disabled={quoteLoading}
                      className="btn-primary flex-1"
                    >
                      Accept & Continue →
                    </button>
                  </div>
                </div>
              )}

              {step === "contact" && (
                <ClientDetailsStep onSubmit={handleContactSubmit} isSubmitting={isPending} />
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-6 text-center text-xs text-white/20 border-t border-white/5">
          CT Drive · Mombasa, Kenya · Liability insulated via tri-party digital agreements
        </footer>
      </div>
    </div>
  );
}
