import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import type { SessionResponse } from "@/types/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: true, user: undefined });
  }
  return NextResponse.json({ success: true, user } satisfies SessionResponse);
}
