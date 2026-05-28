export interface UserAccessRecord {
  freeMapUsed: boolean;
  subscriptionActive: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: number;
}
