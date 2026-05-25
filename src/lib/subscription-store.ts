export interface UserAccessRecord {
  freeMapUsed: boolean;
  subscriptionActive: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: number;
}

const store = new Map<string, UserAccessRecord>();

function defaultRecord(): UserAccessRecord {
  return {
    freeMapUsed: false,
    subscriptionActive: false,
  };
}

export function getUserAccess(userId: string): UserAccessRecord {
  return store.get(userId) ?? defaultRecord();
}

export function canUserGenerate(userId: string): boolean {
  const access = getUserAccess(userId);
  if (access.subscriptionActive) return true;
  return !access.freeMapUsed;
}

export function markFreeMapUsed(userId: string): void {
  const current = getUserAccess(userId);
  store.set(userId, { ...current, freeMapUsed: true });
}

export function activateSubscription(
  userId: string,
  data: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: number;
  }
): void {
  const current = getUserAccess(userId);
  store.set(userId, {
    ...current,
    subscriptionActive: true,
    stripeCustomerId: data.stripeCustomerId ?? current.stripeCustomerId,
    stripeSubscriptionId:
      data.stripeSubscriptionId ?? current.stripeSubscriptionId,
    currentPeriodEnd: data.currentPeriodEnd ?? current.currentPeriodEnd,
  });
}

export function deactivateSubscription(userId: string): void {
  const current = getUserAccess(userId);
  store.set(userId, {
    ...current,
    subscriptionActive: false,
    stripeSubscriptionId: undefined,
    currentPeriodEnd: undefined,
  });
}

export function getAccessSummary(userId: string) {
  const access = getUserAccess(userId);
  return {
    canGenerate: canUserGenerate(userId),
    freeMapUsed: access.freeMapUsed,
    subscriptionActive: access.subscriptionActive,
    freeMapsRemaining: access.subscriptionActive
      ? null
      : access.freeMapUsed
        ? 0
        : 1,
  };
}
