import { Resend } from "resend";
import { render } from "@react-email/components";
import * as React from "react";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.RESEND_FROM_EMAIL;

if (!FROM_EMAIL && process.env.NODE_ENV === "production") {
  throw new Error("Missing FROM_EMAIL environment variable. Email functionality requires a verified sender address.");
}

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
