import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | CT Drive",
  description: "Privacy Policy explaining how we collect, use, and share information on our platform.",
};

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: "We collect information required to facilitate and verify bookings. This includes client name, email, phone number, physical address, and identification documents (ID/Passport and valid driving licenses for self-drive rentals). During handovers, we collect odometer readings, fuel levels, vehicle photos, and client signature coordinates.",
  },
  {
    title: "2. How We Use Information",
    content: "The collected information is used solely to coordinate bookings, generate accurate quotes, dispatch third-party vehicles/drivers, record vehicle conditions, verify compliance, and maintain a paper trail. We do not use your personal information for unrelated marketing purposes without your explicit consent.",
  },
  {
    title: "3. Sharing Information with Partners",
    content: "To execute your booking, we share booking details (client name, phone number, pickup/drop-off locations, and specific requirements) with the assigned third-party fleet partner and their designated driver. Partners are contractually bound to use this information only to execute the transport service.",
  },
  {
    title: "4. Live Tracking Data",
    content: "Our platform displays live status updates for active bookings. Client tracking links (/track/[token]) are protected by a cryptographic token generated per booking. Anyone with access to the link will be able to see the booking status, driver name, vehicle plate number, and route information. We advise against sharing this link publicly.",
  },
  {
    title: "5. Photo Uploads and Storage",
    content: "Inspection photos and client signatures captured during the handover process are uploaded to and stored securely on Cloudinary. These photos serve as official digital documentation of the vehicle state and are kept for audit and liability verification purposes.",
  },
  {
    title: "6. Your Rights and Contact",
    content: "You have the right to request access to or deletion of your personal data collected by our platform, subject to legal bookkeeping obligations. If you have questions regarding your data privacy, please contact the CT Drive data protection officer.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="relative min-h-dvh py-12 px-6 md:px-12">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 right-0 h-96 w-96 bg-amber-500/5 rounded blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-80 w-80 bg-blue-900/10 rounded blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Privacy Policy</h1>
          <p className="text-white/40 text-sm mt-2">Last updated: August 21, 2026</p>
        </div>

        <div className="glass-card p-6 md:p-8 space-y-6">
          <p className="text-white/70 leading-relaxed">
            This Privacy Policy explains how CT Drive collects, uses, and protects your personal data when you interact with our platform.
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
          Have data privacy questions? Contact CT Drive compliance support.
        </div>
      </div>
    </div>
  );
}