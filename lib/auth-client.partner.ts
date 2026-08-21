import { createAuthClient } from "better-auth/react";

export const partnerAuthClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  basePath: "/api/auth/partner",
});
