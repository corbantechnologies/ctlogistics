import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Generates a signed upload signature for direct browser-to-Cloudinary uploads.
 * The signature expires in 60 seconds — the client must upload within that window.
 */
export function generateUploadSignature(folder: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = {
    timestamp,
    folder,
    // Restrict to image uploads only
    allowed_formats: "jpg,jpeg,webp,png",
  };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );
  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    folder,
  };
}

/**
 * Builds a consistent Cloudinary folder path for handover photos.
 * e.g. "ctlogistics/handovers/DELIVERY/booking_abc123"
 */
export function buildHandoverFolder(bookingId: string, handoverType: "DELIVERY" | "COLLECTION") {
  return `ctlogistics/handovers/${handoverType}/${bookingId}`;
}

/**
 * Builds folder path for partner compliance documents (PSV cert, insurance, etc.)
 */
export function buildPartnerDocFolder(partnerId: string) {
  return `ctlogistics/partners/${partnerId}/docs`;
}

export { cloudinary };
