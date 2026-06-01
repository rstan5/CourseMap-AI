import { NextResponse } from "next/server";
import { listCourseMapsForUser } from "@/lib/course-library-store";
import { getAccessSummary } from "@/lib/subscription-store";
import { getAccessOwnerId } from "@/lib/identity";
import { getSessionUser } from "@/lib/auth/session";
import { isFounderEmail } from "@/lib/founders";

export async function GET() {
  const { ownerId, isAuthenticated } = await getAccessOwnerId();
  const mapCount = (await listCourseMapsForUser(ownerId)).length;
  const user = isAuthenticated ? await getSessionUser() : null;
  const isFounder = isAuthenticated && isFounderEmail(user?.email);
  return NextResponse.json({
    success: true,
    data: {
      ...(isFounder
        ? {
            canGenerate: true,
            freeMapUsed: false,
            subscriptionActive: true,
            freeMapsRemaining: null,
          }
        : await getAccessSummary(ownerId, mapCount)),
      isAuthenticated,
    },
  });
}
