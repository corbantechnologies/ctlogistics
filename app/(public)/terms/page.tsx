import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | CT Logistics",
  description: "Terms and conditions governing the use of the CT Logistics platform.",
};

const SECTIONS = [
  {
    title: "1. Nature of Our Services",
    content: "CT Logistics operates as a pure technology orchestrator and logistics broker. We provide a digital platform connecting customers (Guests/Clients) with third-party transport providers (Partners). We do not own, lease, or operate transport vehicles directly, nor are we a common carrier. All transport services are executed by independent third-party transport providers.",
  },
  {
    title: "2. Booking and Quotes",
    content: "All quotes provided via the platform are calculated dynamically based on predefined corridors or per-kilometer rates. Quotes are subject to change until a deposit is received and the booking is confirmed. Confirmation of booking requires a 30% security deposit unless otherwise agreed. The remaining balance must be paid 48 hours prior to service execution or as stated on the invoice.",
  },
  {
    title: "3. Cancellation and Refund Policy",
    content: "Cancellations made more than 48 hours prior to the scheduled departure time will receive a full refund of the deposit, minus a 10% administrative fee. Cancellations made between 24 and 48 hours prior will forfeit the deposit. Cancellations made within 24 hours of departure will be billed the full amount of the booking.",
  },
  {
    title: "4. Liability and Insurance",
    content: "All physical transport risks, vehicle liability, and passenger injuries are covered solely by the third-party partner's commercial PSV or comprehensive private insurance. CT Logistics assumes no liability for any property damage, personal injury, delay, or direct/indirect loss arising from the transport services executed by partners. The client agrees to hold CT Logistics harmless from any claims arising out of the performance of the transport service.",
  },
  {
    title: "5. Digital Handover and Verification",
    content: "For self-drive car rentals, a digital vehicle inspection (delivery and collection protocol) is mandatory. The client or their representative must sign the digital inspect-log. The digital signature and corresponding 5-side photos constitute conclusive proof of the vehicle's condition at the time of handover. The client is liable for any new damages, missing fuel, or excess mileage noted during the return inspection.",
  },
  {
    title: "6. Fuel and Toll Policies",
    content: "For private transfers, highway tolls and return deadhead expenses are factored into the quoted price. For self-drive car rentals, vehicles are provided with a specific fuel level (e.g. 1/2 tank) and must be returned with the same level. A refueling fee plus the cost of fuel will be charged against the security deposit if the vehicle is returned with less fuel.",
  },
];

export default function TermsPage() {
  return (
    <div className="relative min-h-dvh py-12 px-6 md:px-12">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 right-0 h-96 w-96 bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-80 w-80 bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Terms of Service</h1>
          <p className="text-white/40 text-sm mt-2">Last updated: August 21, 2026</p>
        </div>

        <div className="glass-card p-6 md:p-8 space-y-6">
          <p className="text-white/70 leading-relaxed">
            Please read these Terms of Service carefully before using the CT Logistics platform. By booking a service or accessing our platform, you agree to be bound by these terms.
          </p>

          <div className="border-t border-white/8 pt-6 space-y-8">
            {SECTIONS.map((sec) => (
              <div key={sec.title} className="space-y-2">
                <h2 className="text-lg font-bold text-amber-400">{sec.title}</h2>
                <p className="text-white/60 text-sm leading-relaxed">{sec.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-white/20">
          Questions regarding these terms? Contact CT Logistics legal department.
        </div>
      </div>
    </div>
  );
}