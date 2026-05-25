import { NextRequest, NextResponse } from "next/server";
import { migrateAnonymousToAccount } from "@/lib/auth/migrate";
import { createSession } from "@/lib/auth/session";
import { createUser, toAuthUser } from "@/lib/auth/users";
import { getAnonymousId } from "@/lib/identity";
import type { AuthActionResponse } from "@/types/auth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };

    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    const name = body.name?.trim() ?? "";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Enter a valid email address." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const user = await createUser({ email, password, name });
    const anonymousId = await getAnonymousId();
    await migrateAnonymousToAccount(anonymousId, user.id);
    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: toAuthUser(user),
    } satisfies AuthActionResponse);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create account.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
