export interface AccessSummary {
  canGenerate: boolean;
  freeMapUsed: boolean;
  subscriptionActive: boolean;
  freeMapsRemaining: number | null;
  isAuthenticated: boolean;
}

export interface AccessResponse {
  success: boolean;
  data?: AccessSummary;
  error?: string;
}
