import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CT Drive — Kenya's Smartest Transport Platform",
  description:
    "Instant quotes for car rentals, private transfers and safari tours across Kenya. No account needed. Book in under 2 minutes.",
  openGraph: {
    title: "CT Drive — Kenya's Smartest Transport Platform",
    description: "Instant quotes · Real-time tracking · Digital handovers",
    type: "website",
  },
};

const SERVICES = [
  {
    icon: "🚗",
    title: "Self-Drive Rental",
    subtitle: "Saloon to Prado",
    desc: "Clean, insured vehicles delivered to your door. Pick your dates, choose your class, done.",
    features: ["Door delivery available", "Security deposit on return", "GPS-tracked fleet"],
    color: "from-blue-500/15 to-blue-600/5",
    border: "border-blue-500/20",
    badge: "bg-blue-500/15 text-blue-300",
  },
  {
    icon: "🛣️",
    title: "Private Transfers",
    subtitle: "Mombasa ↔ Nairobi & beyond",
    desc: "Fixed-price corridor routes or custom point-to-point. No surcharges, no surprises.",
    features: ["8 major corridors", "Instant pricing", "Meet & greet available"],
    color: "from-amber-500/15 to-amber-600/5",
    border: "border-amber-500/20",
    badge: "bg-amber-500/15 text-amber-300",
  },
  {
    icon: "🦁",
    title: "Safari & Tours",
    subtitle: "Tsavo · Mara · Amboseli",
    desc: "4x4 pop-up cruisers, HiAce safari vans and coaches for multi-day park excursions.",
    features: ["Multi-day itineraries", "Park gate logistics", "Group charters (200+ pax)"],
    color: "from-green-500/15 to-green-600/5",
    border: "border-green-500/20",
    badge: "bg-green-500/15 text-green-300",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Pick Your Service", desc: "Choose from rental, transfer or safari. Get an instant quote — no account, no fluff." },
  { step: "02", title: "Confirm Booking", desc: "Enter your details and pay a 30% deposit via M-Pesa or bank transfer. Fully digital." },
  { step: "03", title: "Track in Real Time", desc: "Get a magic link to your live tracking page. Driver details, itinerary, and status — all in one place." },
];

const STATS = [
  { value: "8+", label: "Major Corridors" },
  { value: "50+", label: "Vetted Partners" },
  { value: "300+", label: "Pax Capacity" },
  { value: "KES 0", label: "Hidden Fees" },
];

const VEHICLES = [
  { emoji: "🚗", name: "Saloon", eg: "Premio / Allion / Fielder" },
  { emoji: "🚙", name: "Compact SUV", eg: "RAV4 / X-Trail" },
  { emoji: "🏎️", name: "Luxury Prado", eg: "TX / TXL" },
  { emoji: "🚐", name: "Safari Cruiser", eg: "Land Cruiser 4x4" },
  { emoji: "🚌", name: "Tour Van", eg: "HiAce Safari" },
  { emoji: "🚌", name: "Minibus", eg: "14-Seater High-roof" },
  { emoji: "🚌", name: "Coaster", eg: "22–33 Seater" },
  { emoji: "🚍", name: "Coach", eg: "50-Seater High-cap" },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[#0b0f1a] text-white overflow-x-hidden">

      {/* ── BACKGROUND GLOWS ─────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 right-0 h-[700px] w-[700px] rounded bg-amber-500/8 blur-[140px]" />
        <div className="absolute top-1/2 -left-40 h-[500px] w-[500px] rounded bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[600px] rounded bg-green-900/10 blur-[100px]" />
      </div>

      {/* ── NAVBAR ───────────────────────────────────────── */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/30">
            <span className="text-black font-black text-sm">CT</span>
          </div>
          <div>
            <span className="font-bold text-white text-lg tracking-tight">CT Drive</span>
            <span className="ml-2 text-xs text-white/30 hidden sm:inline">Mombasa, Kenya</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/50">
          <a href="#services" className="hover:text-white transition-colors">Services</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#fleet" className="hover:text-white transition-colors">Fleet</a>
        </nav>
        <Link href="/book" className="btn-primary py-2.5 px-5 text-sm">
          Book Now
        </Link>
      </header>

      <main className="relative z-10">

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="px-6 md:px-12 pt-20 pb-16 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded border border-amber-400/20 bg-amber-400/8 px-4 py-1.5 text-xs font-medium text-amber-300 mb-8">
            <span className="h-1.5 w-1.5 rounded bg-amber-400 animate-pulse" />
            Serving Mombasa, Nairobi & the Kenyan Coast
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[0.95] tracking-tight mb-6">
            Kenya&apos;s Smartest<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              Transport Platform
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Instant quotes for car rentals, private transfers, and safari tours.
            Real-time tracking and digital handovers — no calls, no guesswork.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/book"
              className="btn-primary px-8 py-4 text-base w-full sm:w-auto"
            >
              Get an Instant Quote →
            </Link>
            <a
              href="#how-it-works"
              className="btn-ghost px-8 py-4 text-base w-full sm:w-auto"
            >
              How It Works
            </a>
          </div>

          {/* Floating stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {STATS.map((s) => (
              <div key={s.label} className="glass-card p-5 text-center">
                <p className="text-3xl font-black text-amber-400">{s.value}</p>
                <p className="text-xs text-white/40 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SERVICES ─────────────────────────────────────── */}
        <section id="services" className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-3">What We Offer</p>
            <h2 className="text-4xl font-black text-white">Three Ways to Move</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className={`relative rounded border ${s.border} bg-gradient-to-br ${s.color} p-7 flex flex-col gap-5 group hover:scale-[1.02] transition-transform duration-200`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-4xl">{s.icon}</span>
                  <span className={`text-xs font-semibold rounded px-3 py-1 ${s.badge}`}>
                    {s.subtitle}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm text-white/50 leading-relaxed">{s.desc}</p>
                </div>
                <ul className="space-y-2 mt-auto">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                      <span className="h-1.5 w-1.5 rounded bg-white/30 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/book"
                  className="mt-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                >
                  Book this service →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────── */}
        <section id="how-it-works" className="px-6 md:px-12 py-20 border-y border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="section-label mb-3">The Process</p>
              <h2 className="text-4xl font-black text-white">Booked in Under 2 Minutes</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={step.step} className="relative">
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-0" />
                  )}
                  <div className="relative z-10 space-y-4">
                    <div className="h-14 w-14 rounded bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                      <span className="font-black text-amber-400 text-lg">{step.step}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{step.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FLEET GRID ───────────────────────────────────── */}
        <section id="fleet" className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-3">The Fleet</p>
            <h2 className="text-4xl font-black text-white">Eight Vehicle Categories</h2>
            <p className="text-white/40 mt-3 text-sm max-w-lg mx-auto">
              From executive saloons to 50-seater coaches — all vetted, insured, and GPS-tracked.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {VEHICLES.map((v) => (
              <Link
                href="/book"
                key={v.name}
                className="glass-card p-5 flex flex-col gap-3 hover:border-amber-400/30 hover:bg-white/[0.06] transition-all duration-200 group"
              >
                <span className="text-3xl">{v.emoji}</span>
                <div>
                  <p className="font-semibold text-white text-sm group-hover:text-amber-400 transition-colors">{v.name}</p>
                  <p className="text-xs text-white/35 mt-0.5">{v.eg}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── TRUST / DIGITAL-FIRST ─────────────────────────── */}
        <section className="px-6 md:px-12 py-20 border-y border-white/5">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="section-label">Why CT Drive</p>
              <h2 className="text-4xl font-black text-white leading-tight">
                A Platform Built for<br />
                <span className="text-amber-400">Accountability</span>
              </h2>
              <p className="text-white/50 leading-relaxed">
                Every booking on CT Drive is backed by a digital paper trail — photos at delivery
                and collection, canvas signatures, M-Pesa references, and GPS data. No more he-said-she-said disputes.
              </p>
              <ul className="space-y-3">
                {[
                  "📸 5-photo vehicle inspection at every handover",
                  "✍️ Digital client signature on collection",
                  "🔗 Magic tracking link — no app download needed",
                  "💳 M-Pesa, bank transfer, or cash — all recorded",
                  "🔒 Separate admin & partner portals with isolated sessions",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                    <span className="text-base">{item.split(" ")[0]}</span>
                    <span>{item.split(" ").slice(1).join(" ")}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mockup card cluster */}
            <div className="relative h-80 hidden md:block">
              <div className="absolute top-0 right-0 w-64 glass-card p-5 space-y-3 shadow-2xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/40">Booking Status</p>
                  <span className="badge badge-in-progress text-xs">🚗 En Route</span>
                </div>
                <p className="font-bold text-white">John Kamau</p>
                <p className="text-xs text-white/50">KDA 456B · Toyota Allion · Silver</p>
                <div className="h-px bg-white/8" />
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Mombasa → Nairobi</span>
                  <span className="text-amber-400 font-bold">KES 8,500</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-56 glass-card p-4 space-y-2 shadow-xl border-amber-400/20">
                <p className="text-xs text-white/40">Quick Quote</p>
                <p className="text-2xl font-black text-white">KES 6,500</p>
                <p className="text-xs text-white/40">Compact SUV · Diani → Mombasa</p>
                <div className="flex gap-2 pt-1">
                  <span className="badge badge-completed text-xs">24% margin</span>
                </div>
              </div>
              <div className="absolute top-16 left-12 w-48 glass-card p-4 shadow-lg">
                <p className="text-xs text-white/40 mb-2">Handover ✓</p>
                <div className="grid grid-cols-3 gap-1">
                  {["🔴", "🟡", "🟢", "🔵", "⚪"].map((c, i) => (
                    <div key={i} className="aspect-square rounded bg-white/5 border border-white/10 flex items-center justify-center text-xs">{c}</div>
                  ))}
                  <div className="aspect-square rounded bg-green-400/20 border border-green-400/30 flex items-center justify-center text-xs">✓</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="px-6 md:px-12 py-24 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-5xl font-black text-white leading-tight">
              Ready to Move?
            </h2>
            <p className="text-white/50 text-lg">
              Get your quote in 60 seconds. No account. No calls. No hidden fees.
            </p>
            <Link
              href="/book"
              className="btn-primary inline-flex px-10 py-4 text-lg"
            >
              Book Your Transfer →
            </Link>
            <p className="text-xs text-white/20 pt-2">
              Instant quote · 30% deposit to confirm · Balance on completion
            </p>
          </div>
        </section>
      </main>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 md:px-12 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-amber-400 flex items-center justify-center">
              <span className="text-black font-black text-xs">CT</span>
            </div>
            <div>
              <p className="font-bold text-white text-sm">Corban Technologies LTD</p>
              <p className="text-xs text-white/30">Mombasa, Kenya</p>
            </div>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 text-xs text-white/30">
            <a href="/book" className="hover:text-white transition-colors">Book a Trip</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
          </nav>
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} Powered by Corban Technologies LTD. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}