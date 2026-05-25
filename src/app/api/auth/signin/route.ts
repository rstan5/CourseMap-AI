import { NextRequest, NextResponse } from "next/server";
import { migrateAnonymousToAccount } from "@/lib/auth/migrate";
import { createSession } from "@/lib/auth/session";
import { authenticateUser, toAuthUser } from "@/lib/auth/users";
import { getAnonymousId } from "@/lib/identity";
import type { AuthActionResponse } from "@/types/auth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const anonymousId = await getAnonymousId();
    await migrateAnonymousToAccount(anonymousId, user.id);
    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: toAuthUser(user),
    } satisfies AuthActionResponse);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not sign in.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
