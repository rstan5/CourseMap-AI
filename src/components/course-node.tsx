"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { getExamRelevanceStyle } from "@/lib/exam-styles";
import type { CourseNodeData } from "@/lib/graphLayout";

function CourseNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as CourseNodeData;
  const examStyle = getExamRelevanceStyle(nodeData.likely_exam_relevance);

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-2 !border-white !bg-primary"
      />
      <div
        className={cn(
          "glass-strong relative w-[220px] rounded-2xl px-4 py-3 transition-all duration-200",
          selected && "ring-2 ring-primary/60 shadow-lg shadow-primary/20",
          examStyle.nodeRingClass,
          nodeData.importance === "core" &&
            "border-[2.5px] border-primary/70 font-bold",
          nodeData.importance === "supporting" && "border border-white/80",
          nodeData.importance === "advanced" &&
            "border border-dashed border-primary/35 opacity-90",
          nodeData.likely_exam_relevance === "low" && "opacity-75"
        )}
      >
        {nodeData.likely_exam_relevance === "high" && (
          <span
            className={cn(
              "absolute -right-1.5 -top-1.5 rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase",
              examStyle.badgeClass
            )}
          >
            Exam
          </span>
        )}
        <p className="line-clamp-2 text-sm font-extrabold leading-snug text-foreground">
          {nodeData.label}
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            {nodeData.importance}
          </p>
          <p
            className={cn(
              "text-[9px] font-bold uppercase",
              nodeData.likely_exam_relevance === "high"
                ? "text-amber-700"
                : nodeData.likely_exam_relevance === "medium"
                  ? "text-primary"
                  : "text-muted-foreground/70"
            )}
          >
            {examStyle.shortLabel}
          </p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-2 !border-white !bg-primary"
      />
    </>
  );
}

export const CourseNode = memo(CourseNodeComponent);
