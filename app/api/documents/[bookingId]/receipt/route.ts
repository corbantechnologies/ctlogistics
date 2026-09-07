import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateBookingReceiptPDF } from "@/lib/pdf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    // Fetch booking details from database
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Access Token guard for client privacy (unless admin session)
    if (token && booking.accessToken !== token) {
      return NextResponse.json({ error: "Unauthorized token" }, { status: 401 });
    }

    const totalSell = parseFloat(booking.totalSellAmount || "0");
    const deposit = parseFloat(booking.securityDeposit || "0");
    const isFullPaid = booking.isFullPaymentReceived;
    const isDepositPaid = booking.isDepositPaid;

    const amountPaid = isFullPaid ? totalSell : isDepositPaid ? deposit : 0;
    const paymentStatus = isFullPaid ? "PAID IN FULL" : isDepositPaid ? "DEPOSIT PAID" : "UNPAID";

    const pdfBuffer = await generateBookingReceiptPDF({
      bookingRef: `BK-${booking.id.substring(0, 8).toUpperCase()}`,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail || "Not Provided",
      clientPhone: booking.clientPhone,
      serviceType: booking.bookingType || "Transport Service",
      vehicleCategory: "Transport / Rental Tier",
      origin: booking.deliveryAddress || "Pickup Point",
      destination: booking.collectionAddress || "Destination Point",
      scheduledDate: booking.rentalStart
        ? new Date(booking.rentalStart).toLocaleDateString("en-KE", { dateStyle: "medium" })
        : "As Scheduled",
      totalAmount: totalSell,
      amountPaid,
      paymentStatus,
      paymentMethod: "M-Pesa / Electronic Transfer",
      datePaid: new Date(booking.updatedAt || booking.createdAt).toLocaleDateString("en-KE", { dateStyle: "medium" }),
    });

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="CTDrive_Receipt_${booking.id.substring(0, 8)}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating receipt PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate receipt PDF", details: error.message },
      { status: 500 }
    );
  }
}
