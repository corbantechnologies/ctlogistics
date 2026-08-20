import { NextRequest, NextResponse } from "next/server";
import { generateUploadSignature, buildHandoverFolder } from "@/lib/cloudinary";
import { db } from "@/db";
import { tripLegs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { handoverToken, bookingId, handoverType } = body;

    // Validate via handover token — only the runner with the correct token can upload
    if (!handoverToken || !bookingId || !handoverType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const leg = await db.query.tripLegs.findFirst({
      where: eq(tripLegs.handoverToken, handoverToken),
    });

    if (!leg) {
      return NextResponse.json({ error: "Invalid handover token" }, { status: 403 });
    }

    const folder = buildHandoverFolder(bookingId, handoverType);
    const signatureData = generateUploadSignature(folder);

    return NextResponse.json(signatureData);
  } catch (err) {
    console.error("Upload sign error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}