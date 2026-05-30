"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Maximize2 } from "lucide-react";
import type { CourseMapData } from "@/types/course";

const CourseGraph = dynamic(
  () => import("@/components/CourseGraph").then((m) => m.CourseGraph),
  {
    ssr: false,
    loading: () => (
      <div className="glass-strong flex min-h-[480px] items-center justify-center rounded-3xl">
        <p className="text-sm font-semibold text-muted-foreground">
          Loading course map…
        </p>
      </div>
    ),
  }
);

interface CourseMapSectionProps {
  course: CourseMapData;
}

export function CourseMapSection({ course }: CourseMapSectionProps) {
  const { course_map_overview: overview } = course;

  return (
    <section className="mt-16 border-t border-white/50 pt-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-primary">
            Your course map · {overview.inferred_subject}
          </p>
          <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
            {overview.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-medium text-muted-foreground">
            {overview.input_reconstruction_summary}
          </p>
          {(overview.key_themes?.length ?? 0) > 0 && (
            <p className="mt-2 text-xs font-semibold text-muted-foreground">
              Key themes: {(overview.key_themes ?? []).join(" · ")}
            </p>
          )}
          <p className="mt-2 text-xs font-semibold text-muted-foreground">
            Structure confidence:{" "}
            <span className="capitalize text-foreground">
              {overview.structure_confidence}
            </span>
          </p>
        </div>
        <Link
          href={`/course-map?id=${course.id}`}
          className="glass-button inline-flex h-11 items-center justify-center gap-2 self-start rounded-2xl px-5 text-sm font-bold text-primary-foreground transition-all hover:brightness-105"
        >
          <Maximize2 className="h-4 w-4" />
          Full screen
        </Link>
      </div>

      <CourseGraph
        conceptMap={course.concept_map}
        learningGraphEdges={course.learning_graph_edges}
        height="min-h-[520px]"
      />
      <p className="mt-4 text-center text-xs font-semibold text-muted-foreground">
        Click a module for details · Solid = prerequisite · Purple = builds on
        · Dashed = related
      </p>
    </section>
  );
}
