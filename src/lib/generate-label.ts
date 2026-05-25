import type { AccessSummary } from "@/types/access";

export const FREE_GENERATE_LABEL = "Generate FREE course map";

export function getUploadGenerateLabel(
  access: AccessSummary | null,
  refining: boolean,
  isAuthenticated: boolean
): string {
  if (refining) return "Add materials & refine map";
  if (access?.subscriptionActive) return "Generate course map";
  if (access?.canGenerate) return FREE_GENERATE_LABEL;
  if (!isAuthenticated) return "Create account to continue";
  return "Subscribe to generate";
}
