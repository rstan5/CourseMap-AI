import { NextRequest, NextResponse } from "next/server";
import {
  getCourseMapForUser,
  storedToClientData,
} from "@/lib/course-library-store";
import { getAuthenticatedUser } from "@/lib/identity";
import type { GetCourseMapResponse } from "@/types/course";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Missing course map id." } satisfies GetCourseMapResponse,
      { status: 400 }
    );
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: "Sign in to view your course map.",
        code: "AUTH_REQUIRED",
      } satisfies GetCourseMapResponse & { code?: string },
      { status: 401 }
    );
  }

  const record = await getCourseMapForUser(user.id, id);

  if (!record) {
    return NextResponse.json(
      {
        success: false,
        error: "Course map not found.",
      } satisfies GetCourseMapResponse,
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: storedToClientData(record),
  } satisfies GetCourseMapResponse);
}
