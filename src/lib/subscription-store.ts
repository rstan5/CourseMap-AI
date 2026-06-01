import { listCourseMapsForUser } from "@/lib/course-library-store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  accessRowToRecord,
  recordToAccessRow,
  type UserAccessRow,
} from "@/lib/supabase/rows";
import type { UserAccessRecord } from "@/types/user-access";

export type { UserAccessRecord } from "@/types/user-access";

function defaultRecord(): UserAccessRecord {
  return {
    freeMapUsed: false,
    subscriptionActive: false,
  };
}

export async function getUserAccess(userId: string): Promise<UserAccessRecord> {
  const { data, error } = await getSupabaseAdmin()
    .from("user_access")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("getUserAccess:", error.message);
    return defaultRecord();
  }
  return accessRowToRecord((data as UserAccessRow | null) ?? null);
}

async function writeRecord(userId: string, record: UserAccessRecord) {
  const row = recordToAccessRow(userId, record);
  const { error } = await getSupabaseAdmin()
    .from("user_access")
    .upsert(row, { onConflict: "user_id" });

  if (error) throw new Error(error.message);
}

/** Sync free_map_used with library: one free new map per account when map count is 0. */
export async function syncFreeTierWithLibrary(userId: string): Promise<void> {
  const mapCount = (await listCourseMapsForUser(userId)).length;
  const access = await getUserAccess(userId);

  if (access.subscriptionActive) return;

  if (mapCount > 0 && !access.freeMapUsed) {
    await markFreeMapUsed(userId);
    return;
  }

  if (mapCount === 0 && access.freeMapUsed) {
    await writeRecord(userId, {
      ...access,
      freeMapUsed: false,
    });
  }
}

/** When mapCount is provided, any existing maps block another free generation. */
export async function canUserGenerate(
  userId: string,
  mapCount?: number
): Promise<boolean> {
  await syncFreeTierWithLibrary(userId);

  const access = await getUserAccess(userId);
  if (access.subscriptionActive) return true;

  const count =
    mapCount ?? (await listCourseMapsForUser(userId)).length;
  if (count > 0) return false;

  return !access.freeMapUsed;
}

export async function markFreeMapUsed(userId: string): Promise<void> {
  const current = await getUserAccess(userId);
  await writeRecord(userId, { ...current, freeMapUsed: true });
}

export async function activateSubscription(
  userId: string,
  data: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: number;
  }
): Promise<void> {
  const current = await getUserAccess(userId);
  await writeRecord(userId, {
    ...current,
    subscriptionActive: true,
    stripeCustomerId: data.stripeCustomerId ?? current.stripeCustomerId,
    stripeSubscriptionId:
      data.stripeSubscriptionId ?? current.stripeSubscriptionId,
    currentPeriodEnd: data.currentPeriodEnd ?? current.currentPeriodEnd,
  });
}

export async function deactivateSubscription(userId: string): Promise<void> {
  const current = await getUserAccess(userId);
  await writeRecord(userId, {
    ...current,
    subscriptionActive: false,
    stripeSubscriptionId: undefined,
    currentPeriodEnd: undefined,
  });
}

export async function findUserIdBySubscriptionId(
  subscriptionId: string
): Promise<string | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("user_access")
    .select("user_id")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();

  if (error) {
    console.error("findUserIdBySubscriptionId:", error.message);
    return null;
  }
  return data?.user_id ?? null;
}

export async function getAccessSummary(userId: string, mapCount?: number) {
  const canGenerate = await canUserGenerate(userId, mapCount);
  const access = await getUserAccess(userId);
  return {
    canGenerate,
    freeMapUsed: access.freeMapUsed,
    subscriptionActive: access.subscriptionActive,
    freeMapsRemaining: access.subscriptionActive
      ? null
      : canGenerate
        ? 1
        : 0,
  };
}
