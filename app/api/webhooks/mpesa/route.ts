import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendBookingReceipt } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[MPESA WEBHOOK RECEIVED]:", JSON.stringify(body, null, 2));

    const stkCallback = body?.Body?.stkCallback;
    if (!stkCallback) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid callback payload" }, { status: 400 });
    }

    const resultCode = stkCallback.ResultCode;
    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultDesc = stkCallback.ResultDesc;

    if (!checkoutRequestId) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Missing CheckoutRequestID" }, { status: 400 });
    }

    // Find booking associated with this CheckoutRequestID
    const targetBooking = await db.query.bookings.findFirst({
      where: eq(bookings.mpesaCheckoutRequestId, checkoutRequestId),
    });

    if (!targetBooking) {
      console.warn(`[MPESA WEBHOOK] No matching booking for CheckoutRequestID: ${checkoutRequestId}`);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (resultCode === 0) {
      // Extract Callback Metadata items (MpesaReceiptNumber, Amount, PhoneNumber, etc.)
      const metadataItems: Array<{ Name: string; Value: any }> = stkCallback.CallbackMetadata?.Item || [];
      
      let mpesaReceiptNumber = "";
      let amountPaid = 0;

      for (const item of metadataItems) {
        if (item.Name === "MpesaReceiptNumber") mpesaReceiptNumber = String(item.Value);
        if (item.Name === "Amount") amountPaid = Number(item.Value);
      }

      const totalSell = parseFloat(targetBooking.totalSellAmount || "0");
      const isFull = amountPaid >= totalSell || targetBooking.isDepositPaid;

      // Update Booking Payment Status
      await db
        .update(bookings)
        .set({
          isDepositPaid: true,
          isFullPaymentReceived: isFull,
          paymentStatus: isFull ? "PAID_FULL" : "DEPOSIT_PAID",
          status: "CONFIRMED",
          mpesaReceiptNumber: mpesaReceiptNumber || `MP-${Date.now()}`,
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, targetBooking.id));

      console.log(`[MPESA WEBHOOK SUCCESS] Booking #${targetBooking.id} payment confirmed. Receipt: ${mpesaReceiptNumber}`);

      // Send PDF Receipt Email to Client
      if (targetBooking.clientEmail) {
        await sendBookingReceipt({
          to: targetBooking.clientEmail,
          clientName: targetBooking.clientName,
          bookingRef: `BK-${targetBooking.id.substring(0, 8).toUpperCase()}`,
          amountPaid,
          paymentMethod: `M-Pesa (${mpesaReceiptNumber})`,
          receiptUrl: `https://www.ctdrive.co.ke/api/documents/${targetBooking.id}/receipt?token=${targetBooking.accessToken}`,
        }).catch(err => console.error("Failed to send receipt email after M-Pesa webhook:", err));
      }
    } else {
      console.warn(`[MPESA WEBHOOK FAILED/CANCELLED] ResultCode ${resultCode}: ${resultDesc}`);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (error: any) {
    console.error("[MPESA WEBHOOK ERROR]:", error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: error.message }, { status: 500 });
  }
}
