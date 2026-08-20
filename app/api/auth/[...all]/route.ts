import { adminAuth } from "@/lib/auth.admin";
import { partnerAuth } from "@/lib/auth.partner";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

// Route admin auth calls to adminAuth, partner calls to partnerAuth
// Admin auth: /api/auth/admin/...
// Partner auth: /api/auth/partner/...
const adminHandler = toNextJsHandler(adminAuth);
const partnerHandler = toNextJsHandler(partnerAuth);

export async function GET(req: NextRequest, ctx: { params: Promise<{ all: string[] }> }) {
  const { all } = await ctx.params;
  if (all[0] === "admin") return adminHandler.GET(req);
  if (all[0] === "partner") return partnerHandler.GET(req);
  return new Response("Not found", { status: 404 });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ all: string[] }> }) {
  const { all } = await ctx.params;
  if (all[0] === "admin") return adminHandler.POST(req);
  if (all[0] === "partner") return partnerHandler.POST(req);
  return new Response("Not found", { status: 404 });
}