import { migrateLibraryOwner } from "@/lib/course-library-store";
import { getUserAccess, markFreeMapUsed, activateSubscription } from "@/lib/subscription-store";

export async function migrateAnonymousToAccount(
  anonymousId: string,
  accountId: string
): Promise<void> {
  await migrateLibraryOwner(anonymousId, accountId);

  const anonAccess = getUserAccess(anonymousId);
  const accountAccess = getUserAccess(accountId);

  if (anonAccess.freeMapUsed && !accountAccess.freeMapUsed) {
    markFreeMapUsed(accountId);
  }

  if (anonAccess.subscriptionActive && !accountAccess.subscriptionActive) {
    activateSubscription(accountId, {
      stripeCustomerId: anonAccess.stripeCustomerId,
      stripeSubscriptionId: anonAccess.stripeSubscriptionId,
      currentPeriodEnd: anonAccess.currentPeriodEnd,
    });
  }
}
