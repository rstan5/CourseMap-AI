import { NextResponse } from "next/server";
import { getAccessSummary } from "@/lib/subscription-store";
import { getAccessOwnerId } from "@/lib/identity";

export async function GET() {
  const { ownerId, isAuthenticated } = await getAccessOwnerId();
  return NextResponse.json({
    success: true,
    data: {
      ...getAccessSummary(ownerId),
      isAuthenticated,
    },
  });
}
