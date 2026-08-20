import { nanoid } from "nanoid";

/**
 * Generates a cryptographically random, URL-safe 32-character token.
 * Used for booking magic links: /track/[token]
 */
export function generateAccessToken(): string {
  return nanoid(32);
}

/**
 * Generates a cryptographically random, URL-safe 32-character token.
 * Used for runner handover links: /handover/[token]
 * Stored on the tripLeg row (handoverToken column).
 */
export function generateHandoverToken(): string {
  return nanoid(32);
}
