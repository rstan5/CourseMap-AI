import { listCourseMapsForUser, migrateLibraryOwner } from "@/lib/course-library-store";
import {
  activateSubscription,
  getUserAccess,
  markFreeMapUsed,
} from "@/lib/subscription-store";

export async function migrateAnonymousToAccount(
  anonymousId: string,
  accountId: string
): Promise<void> {
  await migrateLibraryOwner(anonymousId, accountId);

  const anonAccess = await getUserAccess(anonymousId);
  const accountAccess = await getUserAccess(accountId);
  const migratedMaps = await listCourseMapsForUser(accountId);

  // Only consume the account's free map if maps actually moved over.
  // Do not copy anonymous freeMapUsed alone — same browser cm_uid would
  // block every new account after the first anonymous visit.
  if (migratedMaps.length > 0 && !accountAccess.freeMapUsed) {
    await markFreeMapUsed(accountId);
  }

  if (anonAccess.subscriptionActive && !accountAccess.subscriptionActive) {
    await activateSubscription(accountId, {
      stripeCustomerId: anonAccess.stripeCustomerId,
      stripeSubscriptionId: anonAccess.stripeSubscriptionId,
      currentPeriodEnd: anonAccess.currentPeriodEnd,
    });
  }
}
