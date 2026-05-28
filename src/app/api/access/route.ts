import { NextResponse } from "next/server";
import { listCourseMapsForUser } from "@/lib/course-library-store";
import { getAccessSummary } from "@/lib/subscription-store";
import { getAccessOwnerId } from "@/lib/identity";

export async function GET() {
  const { ownerId, isAuthenticated } = await getAccessOwnerId();
  const mapCount = (await listCourseMapsForUser(ownerId)).length;
  return NextResponse.json({
    success: true,
    data: {
      ...(await getAccessSummary(ownerId, mapCount)),
      isAuthenticated,
    },
  });
}
