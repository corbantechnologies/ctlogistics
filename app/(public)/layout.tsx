import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CT Drive — Smart Transport Solutions",
  description:
    "Instant quotes and seamless bookings for car rentals, private transfers, and safari tours across Kenya.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
