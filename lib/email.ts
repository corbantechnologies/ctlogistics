import { Resend } from "resend";
import { render } from "@react-email/components";
import * as React from "react";

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "bookings@ctlogistics.co.ke";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
}

/**
 * Global wrapper to send emails using Resend.
 * In development, if RESEND_API_KEY is not set or starts with 're_dummy', 
 * it will mock the send and log to the console.
 */
export async function sendEmail({ to, subject, react }: EmailOptions) {
  if (process.env.NODE_ENV !== "production" && (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_dummy"))) {
    console.log("========================================");
    console.log(`[MOCK EMAIL] To: ${to}`);
    console.log(`[MOCK EMAIL] Subject: ${subject}`);
    console.log("[MOCK EMAIL] Content omitted in console log.");
    console.log("========================================");
    return { success: true, mocked: true };
  }

  try {
    const data = await resend.emails.send({
      from: `CT Logistics <${FROM_EMAIL}>`,
      to,
      subject,
      react,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    return { success: false, error };
  }
}
