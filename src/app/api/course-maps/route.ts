import { NextResponse } from "next/server";
import { listCourseMapsForUser } from "@/lib/course-library-store";
import { getAuthenticatedUser } from "@/lib/identity";
import type { CourseMapsListResponse } from "@/types/course-library";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: "Sign in to view your saved courses.",
        code: "AUTH_REQUIRED",
      },
      { status: 401 }
    );
  }

  const data = await listCourseMapsForUser(user.id);
  return NextResponse.json({
    success: true,
    data,
  } satisfies CourseMapsListResponse);
}
