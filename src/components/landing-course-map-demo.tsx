"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { examRelevanceConfig, examWeightLabel } from "@/lib/exam-styles";
import {
  DEMO_COURSE_MAP,
  DEMO_HIGHLIGHT_MODULE_ID,
} from "@/lib/demo-course-map";
import { cn } from "@/lib/utils";

const CourseGraph = dynamic(
  () => import("@/components/CourseGraph").then((m) => m.CourseGraph),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[380px] items-center justify-center sm:h-[420px]">
        <p className="text-sm font-semibold text-muted-foreground">
          Loading preview…
        </p>
      </div>
    ),
  }
);

export function LandingCourseMapDemo() {
  const highlight = DEMO_COURSE_MAP.concept_map.find(
    (m) => m.id === DEMO_HIGHLIGHT_MODULE_ID
  )!;
  const examStyle = examRelevanceConfig[highlight.likely_exam_relevance];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mb-10 text-center">
        <p className="glass-pill mb-4 inline-flex rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          Example output
        </p>
        <h2 className="text-2xl font-extrabold sm:text-4xl">
          From messy notes to a map you can study
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-muted-foreground sm:text-base">
          Your materials become an interactive course map — concepts connected,
          exam priority highlighted, and each topic broken into learning points.
        </p>
      </div>

      <div className="glass-strong overflow-hidden rounded-3xl p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-2 border-b border-white/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Sample course map
            </p>
            <h3 className="text-lg font-extrabold sm:text-xl">
              {DEMO_COURSE_MAP.course_map_overview.title}
            </h3>
          </div>
          <p className="text-xs font-semibold text-muted-foreground">
            Your map is fully interactive after you generate
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="overflow-hidden rounded-2xl border border-white/60 bg-[#eef2ff]/30">
            <CourseGraph
              conceptMap={DEMO_COURSE_MAP.concept_map}
              height="h-[380px] sm:h-[420px]"
              className="rounded-2xl"
              previewMode
            />
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              When you click a topic
            </p>
            <div className="glass-soft flex flex-1 flex-col rounded-2xl border border-white/70 p-4">
              <div className="flex flex-wrap gap-2">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                    examStyle.badgeClass
                  )}
                >
                  {examStyle.shortLabel}
                </span>
                <span className="glass-pill rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                  {highlight.importance}
                </span>
              </div>
              <h4 className="mt-2 text-base font-extrabold leading-snug">
                {highlight.module}
              </h4>
              <p className="mt-2 text-xs font-medium leading-relaxed text-muted-foreground">
                {highlight.exam_priority_note}
              </p>

              <p className="mt-4 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                What you need to know
              </p>
              <ul className="mt-2 flex flex-col gap-2">
                {highlight.learning_points.map((point) => {
                  const style = examRelevanceConfig[point.exam_weight];
                  return (
                    <li
                      key={point.point}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-xs leading-snug",
                        style.pointClass
                      )}
                    >
                      <span
                        className={cn(
                          "mb-1 block text-[9px] font-bold uppercase",
                          style.badgeClass
                        )}
                      >
                        {examWeightLabel(point.exam_weight)}
                      </span>
                      {point.point}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-white/60 pt-6 sm:flex-row">
          <p className="max-w-md text-center text-sm font-semibold text-muted-foreground sm:text-left">
            Solid arrows = prerequisites · Dashed = related topics · Gold =
            high exam yield
          </p>
          <Link
            href="/generate"
            className="glass-button inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-bold text-primary-foreground transition-all hover:brightness-105"
          >
            <Sparkles className="h-4 w-4" />
            Generate FREE course map
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
