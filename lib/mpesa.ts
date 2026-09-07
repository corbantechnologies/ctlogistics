export interface StkPushParams {
  phoneNumber: string; // e.g. 0712345678 or 254712345678
  amount: number; // Integer amount in KES
  accountReference: string; // e.g. BK-98A7F2
  transactionDesc: string; // e.g. CT Drive Booking Deposit
  bookingId: string;
}

const MPESA_ENV = process.env.MPESA_ENV || "sandbox"; // 'sandbox' or 'production'
const BASE_URL = MPESA_ENV === "production"
  ? "https://api.safaricom.co.ke"
  : "https://sandbox.safaricom.co.ke";

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || "";
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "";
const SHORTCODE = process.env.MPESA_SHORTCODE || "174379";
const PASSKEY = process.env.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || "https://www.ctdrive.co.ke/api/webhooks/mpesa";

/**
 * Format Kenyan phone number to 2547XXXXXXXX format
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.substring(1);
  } else if (cleaned.startsWith("7") || cleaned.startsWith("1")) {
    cleaned = "254" + cleaned;
  } else if (cleaned.startsWith("+254")) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Obtain OAuth Access Token from Safaricom Daraja API
 */
export async function getMpesaAccessToken(): Promise<string> {
  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error("Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET environment variables.");
  }

  const authHeader = "Basic " + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");

  const response = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      Authorization: authHeader,
    },
    cache: "no-store",
  });

  const data = await response.json();
  if (!data.access_token) {
    throw new Error(`Failed to obtain M-Pesa Access Token: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

/**
 * Trigger Safaricom M-Pesa STK Push prompt to client's phone
 */
export async function initiateStkPush({
  phoneNumber,
  amount,
  accountReference,
  transactionDesc,
}: StkPushParams) {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const isMock = !CONSUMER_KEY || CONSUMER_KEY.startsWith("mock") || process.env.NODE_ENV !== "production";

  if (isMock && !process.env.MPESA_CONSUMER_KEY) {
    console.log("========================================");
    console.log(`[MOCK STK PUSH] Initiated to ${formattedPhone}`);
    console.log(`[MOCK STK PUSH] Amount: KES ${amount}`);
    console.log(`[MOCK STK PUSH] Reference: ${accountReference}`);
    console.log("========================================");

    const mockCheckoutId = `ws_CO_MOCK_${Date.now()}`;
    return {
      success: true,
      mocked: true,
      checkoutRequestId: mockCheckoutId,
      customerMessage: "Success. Request accepted for processing (Dev Sandbox Mode).",
    };
  }

  try {
    const accessToken = await getMpesaAccessToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14); // YYYYMMDDHHmmss

    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString("base64");

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: CALLBACK_URL,
      AccountReference: accountReference.substring(0, 12),
      TransactionDesc: transactionDesc.substring(0, 12),
    };

    const response = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.ResponseCode === "0") {
      return {
        success: true,
        checkoutRequestId: data.CheckoutRequestID as string,
        customerMessage: data.CustomerMessage as string,
      };
    } else {
      console.error("[MPESA STK ERROR]:", data);
      return {
        success: false,
        error: data.ResponseDescription || "Failed to trigger M-Pesa STK push prompt.",
      };
    }
  } catch (error: any) {
    console.error("[MPESA EXCEPTION]:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred during M-Pesa checkout.",
    };
  }
}
