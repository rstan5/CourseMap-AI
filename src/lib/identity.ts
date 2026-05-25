import { getOrCreateUserId } from "@/lib/user-id";
import { getSessionUser, getSessionUserId } from "@/lib/auth/session";
import type { AuthUser } from "@/types/auth";

export async function getAnonymousId(): Promise<string> {
  return getOrCreateUserId();
}

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  return getSessionUser();
}

export async function requireAuthenticatedUser(): Promise<AuthUser | null> {
  return getSessionUser();
}

export async function getAccessOwnerId(): Promise<{
  ownerId: string;
  isAuthenticated: boolean;
}> {
  const user = await getSessionUser();
  if (user) return { ownerId: user.id, isAuthenticated: true };
  const anonymousId = await getAnonymousId();
  return { ownerId: anonymousId, isAuthenticated: false };
}

export async function getLibraryOwnerId(): Promise<string | null> {
  return getSessionUserId();
}
