import type { ExamRelevance } from "@/types/course";

export const examRelevanceConfig: Record<
  ExamRelevance,
  {
    label: string;
    shortLabel: string;
    bannerClass: string;
    badgeClass: string;
    nodeRingClass: string;
    pointClass: string;
    priority: number;
  }
> = {
  high: {
    label: "High exam priority",
    shortLabel: "High yield",
    bannerClass:
      "border-amber-300/80 bg-gradient-to-r from-amber-50/95 to-amber-100/80 text-amber-900",
    badgeClass: "bg-amber-400/90 text-amber-950 shadow-sm shadow-amber-200",
    nodeRingClass: "ring-2 ring-amber-400/70",
    pointClass: "border-amber-200/80 bg-amber-50/70 font-bold text-amber-950",
    priority: 3,
  },
  medium: {
    label: "Moderate exam priority",
    shortLabel: "Medium",
    bannerClass: "border-primary/30 bg-primary/10 text-foreground",
    badgeClass: "bg-primary/25 text-primary",
    nodeRingClass: "ring-1 ring-primary/30",
    pointClass: "border-white/70 bg-white/40 font-semibold text-foreground/90",
    priority: 2,
  },
  low: {
    label: "Lower exam priority",
    shortLabel: "Low yield",
    bannerClass: "border-white/60 bg-muted/30 text-muted-foreground",
    badgeClass: "bg-white/50 text-muted-foreground",
    nodeRingClass: "",
    pointClass: "border-white/50 bg-white/20 font-medium text-muted-foreground",
    priority: 1,
  },
};

export function examWeightLabel(weight: ExamRelevance): string {
  if (weight === "high") return "Likely on exam";
  if (weight === "medium") return "Good to know";
  return "Lower priority";
}
