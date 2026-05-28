"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock,
  GraduationCap,
  Layers,
  Sparkles,
  Target,
} from "lucide-react";
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
  const overview = DEMO_COURSE_MAP.course_map_overview;
  const highlight = DEMO_COURSE_MAP.concept_map.find(
    (m) => m.id === DEMO_HIGHLIGHT_MODULE_ID
  )!;
  const examStyle = examRelevanceConfig[highlight.likely_exam_relevance];
  const learningPoints = [...highlight.learning_points].sort(
    (a, b) =>
      examRelevanceConfig[b.exam_weight].priority -
      examRelevanceConfig[a.exam_weight].priority
  );
  const highCount = learningPoints.filter((p) => p.exam_weight === "high").length;

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
          Same structure you get after generating: course overview, dependency
          graph, exam-priority learning points, and high-yield focus areas.
        </p>
      </div>

      <div className="glass-strong overflow-hidden rounded-3xl p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 border-b border-white/60 pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                {overview.inferred_subject} · {overview.structure_confidence}{" "}
                confidence
              </p>
              <h3 className="mt-1 text-lg font-extrabold sm:text-xl">
                {overview.title}
              </h3>
              <p className="mt-2 max-w-2xl text-sm font-medium text-muted-foreground">
                {overview.input_reconstruction_summary}
              </p>
              {overview.key_themes.length > 0 && (
                <p className="mt-2 text-xs font-semibold text-muted-foreground">
                  Key themes: {overview.key_themes.join(" · ")}
                </p>
              )}
            </div>
            <p className="text-xs font-semibold text-muted-foreground sm:max-w-[200px] sm:text-right">
              Fully interactive after you generate — click any module
            </p>
          </div>

          {DEMO_COURSE_MAP.high_yield_map.must_know.length > 0 && (
            <div className="glass-soft rounded-2xl px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                High-yield focus
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {DEMO_COURSE_MAP.high_yield_map.must_know.map((id) => {
                  const mod = DEMO_COURSE_MAP.concept_map.find((m) => m.id === id);
                  return (
                    <span
                      key={id}
                      className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold text-amber-800"
                    >
                      Must know: {mod?.module ?? id}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="overflow-hidden rounded-2xl border border-white/60 bg-[#eef2ff]/30">
            <CourseGraph
              conceptMap={DEMO_COURSE_MAP.concept_map}
              learningGraphEdges={DEMO_COURSE_MAP.learning_graph_edges}
              height="h-[380px] sm:h-[420px]"
              className="rounded-2xl"
              previewMode
            />
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Click a topic — same detail panel as your map
            </p>
            <div className="glass-soft flex max-h-[420px] flex-1 flex-col overflow-y-auto rounded-2xl border border-white/70">
              <div className="border-b border-white/60 px-4 py-4">
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
                  <span className="glass-soft rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                    {highlight.difficulty}
                  </span>
                </div>
                <h4 className="mt-2 text-base font-extrabold leading-snug">
                  {highlight.module}
                </h4>
              </div>

              <div className="space-y-5 px-4 py-4">
                <div className={cn("rounded-2xl border px-3 py-3", examStyle.bannerClass)}>
                  <div className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs font-extrabold">{examStyle.label}</span>
                    {highCount > 0 && (
                      <span className="ml-auto rounded-full bg-white/60 px-2 py-0.5 text-[9px] font-bold">
                        {highCount} high-yield
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-semibold leading-relaxed">
                    {highlight.exam_priority_note}
                  </p>
                </div>

                <div className="flex gap-2">
                  <div className="glass-soft flex flex-1 flex-col rounded-xl px-3 py-2">
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Mastery
                    </span>
                    <span className="text-sm font-extrabold">
                      ~{highlight.estimated_mastery_hours}h
                    </span>
                  </div>
                  <div
                    className={cn(
                      "flex flex-1 flex-col rounded-xl border px-3 py-2",
                      examStyle.bannerClass
                    )}
                  >
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase text-muted-foreground">
                      <GraduationCap className="h-3 w-3" />
                      Exam focus
                    </span>
                    <span className="text-sm font-extrabold capitalize">
                      {highlight.likely_exam_relevance}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    Overview
                  </p>
                  <p className="text-xs font-medium leading-relaxed text-foreground/90">
                    {highlight.detailed_description}
                  </p>
                </div>

                <div>
                  <p className="mb-1.5 flex items-center gap-2 text-xs font-bold text-foreground">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    What this really covers
                  </p>
                  <p className="text-xs font-medium leading-relaxed text-foreground/90">
                    {highlight.what_this_really_covers}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold text-muted-foreground">
                    Why it matters: {highlight.why_it_matters}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold text-foreground">
                    What you need to know
                  </p>
                  <ul className="flex flex-col gap-2">
                    {learningPoints.map((point) => {
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
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-white/60 pt-6 sm:flex-row">
          <p className="max-w-md text-center text-sm font-semibold text-muted-foreground sm:text-left">
            Solid = prerequisite · Purple = builds on · Dashed = related · Gold
            badge = high exam yield
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
