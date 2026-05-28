import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { getCookieDomain } from "@/lib/cookie-domain";

export const USER_ID_COOKIE = "cm_uid";

export async function getOrCreateUserId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(USER_ID_COOKIE)?.value;
  if (existing) return existing;

  const userId = randomUUID();
  jar.set(USER_ID_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    domain: getCookieDomain(),
  });
  return userId;
}

export async function getUserId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(USER_ID_COOKIE)?.value ?? null;
}
