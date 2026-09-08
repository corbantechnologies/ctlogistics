import { Resend } from "resend";
import * as React from "react";

import BookingConfirmationEmail from "@/emails/BookingConfirmation";
import BookingReceiptEmail from "@/emails/BookingReceipt";
import DriverAssignedEmail from "@/emails/DriverAssigned";
import InquiryReceivedEmail from "@/emails/InquiryReceived";
import InsuranceAlertEmail from "@/emails/InsuranceAlert";
import PartnerWelcomeEmail from "@/emails/PartnerWelcome";
import PaymentRequestEmail from "@/emails/PaymentRequest";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "bookings@ctdrive.co.ke";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
}

/**
 * Global wrapper to send emails using Resend.
 * In development, if RESEND_API_KEY is not set or starts with 're_dummy', 
 * it will mock the send and log to the console cleanly.
 */
export async function sendEmail({ to, subject, react }: EmailOptions) {
  const isMock = !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_dummy");

  if (isMock) {
    console.log("========================================");
    console.log(`[MOCK EMAIL] To: ${Array.isArray(to) ? to.join(", ") : to}`);
    console.log(`[MOCK EMAIL] Subject: ${subject}`);
    console.log("[MOCK EMAIL] Email queued successfully (Development Sandbox Mode).");
    console.log("========================================");
    return { success: true, mocked: true };
  }

  try {
    const response = await resend.emails.send({
      from: `CT Drive <${FROM_EMAIL}>`,
      to,
      subject,
      react,
    });
    
    if (response.error) {
      console.error("[RESEND API ERROR]:", response.error);
      throw new Error(response.error.message);
    }
    
    console.log(`[EMAIL SENT] Successfully sent email to ${to}. ID: ${response.data?.id}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("[EMAIL FAILED] Failed to send email via Resend:", error.message || error);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// Transactional Helper Functions
// -----------------------------------------------------------------------------

export async function sendBookingConfirmation({
  to,
  clientName,
  bookingRef,
  serviceType,
  totalAmount,
  trackingLink,
}: {
  to: string;
  clientName: string;
  bookingRef: string;
  serviceType: string;
  totalAmount: number;
  trackingLink: string;
}) {
  return sendEmail({
    to,
    subject: `Booking Received #${bookingRef} — CT Drive`,
    react: React.createElement(BookingConfirmationEmail, {
      clientName,
      bookingRef,
      serviceType,
      totalAmount,
      trackingLink,
    }),
  });
}

export async function sendInquiryReceived({
  to,
  clientName,
  inquiryRef,
  serviceType,
  pickupLocation,
  destination,
  pickupDate,
  trackingLink,
}: {
  to: string;
  clientName: string;
  inquiryRef: string;
  serviceType: string;
  pickupLocation: string;
  destination: string;
  pickupDate: string;
  trackingLink: string;
}) {
  return sendEmail({
    to,
    subject: `Inquiry Received #${inquiryRef} — CT Drive`,
    react: React.createElement(InquiryReceivedEmail, {
      clientName,
      inquiryRef,
      serviceType,
      pickupLocation,
      destination,
      pickupDate,
      trackingLink,
    }),
  });
}

export async function sendPaymentRequest({
  to,
  clientName,
  bookingRef,
  serviceType,
  vehicleCategory,
  totalAmount,
  depositRequired,
  paymentUrl,
}: {
  to: string;
  clientName: string;
  bookingRef: string;
  serviceType: string;
  vehicleCategory: string;
  totalAmount: number;
  depositRequired: number;
  paymentUrl: string;
}) {
  return sendEmail({
    to,
    subject: `Vehicle Confirmed! Complete Payment for #${bookingRef} — CT Drive`,
    react: React.createElement(PaymentRequestEmail, {
      clientName,
      bookingRef,
      serviceType,
      vehicleCategory,
      totalAmount,
      depositRequired,
      paymentUrl,
    }),
  });
}

export async function sendDriverAssigned({
  to,
  clientName,
  bookingRef,
  driverName,
  driverPhone,
  vehicleModel,
  vehiclePlate,
  trackingLink,
}: {
  to: string;
  clientName: string;
  bookingRef: string;
  driverName: string;
  driverPhone: string;
  vehicleModel: string;
  vehiclePlate: string;
  trackingLink: string;
}) {
  return sendEmail({
    to,
    subject: `Driver Details Assigned for #${bookingRef} — CT Drive`,
    react: React.createElement(DriverAssignedEmail, {
      clientName,
      bookingRef,
      driverName,
      driverPhone,
      vehicleModel,
      vehiclePlate,
      trackingLink,
    }),
  });
}

export async function sendBookingReceipt({
  to,
  clientName,
  bookingRef,
  amountPaid,
  paymentMethod,
  receiptUrl,
}: {
  to: string;
  clientName: string;
  bookingRef: string;
  amountPaid: number;
  paymentMethod: string;
  receiptUrl: string;
}) {
  return sendEmail({
    to,
    subject: `Payment Receipt for #${bookingRef} — CT Drive`,
    react: React.createElement(BookingReceiptEmail, {
      clientName,
      bookingRef,
      amountPaid,
      paymentMethod,
      receiptUrl,
    }),
  });
}

export async function sendPartnerWelcome({
  to,
  partnerName,
  loginEmail,
  tempPassword,
  portalLink,
}: {
  to: string;
  partnerName: string;
  loginEmail: string;
  tempPassword?: string;
  portalLink: string;
}) {
  return sendEmail({
    to,
    subject: `Welcome to CT Drive Partner Network`,
    react: React.createElement(PartnerWelcomeEmail, {
      partnerName,
      loginEmail,
      tempPassword,
      portalLink,
    }),
  });
}

export async function sendInsuranceAlert({
  to,
  partnerName,
  vehiclePlate,
  expiryDate,
  daysRemaining,
}: {
  to: string;
  partnerName: string;
  vehiclePlate: string;
  expiryDate: string;
  daysRemaining: number;
}) {
  return sendEmail({
    to,
    subject: `[ALERT] Insurance Expiring in ${daysRemaining} days — ${vehiclePlate}`,
    react: React.createElement(InsuranceAlertEmail, {
      partnerName,
      vehiclePlate,
      expiryDate,
      daysRemaining,
    }),
  });
}
