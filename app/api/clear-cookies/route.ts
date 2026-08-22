import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  for (const cookie of allCookies) {
    cookieStore.delete(cookie.name);
  }

  return NextResponse.json({
    success: true,
    message: `Cleared ${allCookies.length} cookies.`,
    clearedCookies: allCookies.map(c => c.name)
  });
}
