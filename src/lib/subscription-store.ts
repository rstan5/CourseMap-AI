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

/** When mapCount is provided, any existing maps block another free generation. */
export async function canUserGenerate(
  userId: string,
  mapCount?: number
): Promise<boolean> {
  const access = await getUserAccess(userId);
  if (access.subscriptionActive) return true;
  if (mapCount !== undefined && mapCount > 0) return false;
  return !access.freeMapUsed;
}

export async function markFreeMapUsed(userId: string): Promise<void> {
  const current = await getUserAccess(userId);
  const row = recordToAccessRow(userId, { ...current, freeMapUsed: true });
  const { error } = await getSupabaseAdmin()
    .from("user_access")
    .upsert(row, { onConflict: "user_id" });

  if (error) throw new Error(error.message);
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
  const row = recordToAccessRow(userId, {
    ...current,
    subscriptionActive: true,
    stripeCustomerId: data.stripeCustomerId ?? current.stripeCustomerId,
    stripeSubscriptionId:
      data.stripeSubscriptionId ?? current.stripeSubscriptionId,
    currentPeriodEnd: data.currentPeriodEnd ?? current.currentPeriodEnd,
  });
  const { error } = await getSupabaseAdmin()
    .from("user_access")
    .upsert(row, { onConflict: "user_id" });

  if (error) throw new Error(error.message);
}

export async function deactivateSubscription(userId: string): Promise<void> {
  const current = await getUserAccess(userId);
  const row = recordToAccessRow(userId, {
    ...current,
    subscriptionActive: false,
    stripeSubscriptionId: undefined,
    currentPeriodEnd: undefined,
  });
  const { error } = await getSupabaseAdmin()
    .from("user_access")
    .upsert(row, { onConflict: "user_id" });

  if (error) throw new Error(error.message);
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
  const access = await getUserAccess(userId);
  const canGenerate = await canUserGenerate(userId, mapCount);
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
