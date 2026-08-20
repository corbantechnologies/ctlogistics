import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.accessToken, token),
    columns: { status: true, updatedAt: true },
  });

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    status: booking.status,
    updatedAt: booking.updatedAt,
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}