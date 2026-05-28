"use client";

import {
  X,
  GitBranch,
  Link2,
  Layers,
  Clock,
  GraduationCap,
  Target,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { examRelevanceConfig, examWeightLabel } from "@/lib/exam-styles";
import type { ConceptMapModule } from "@/types/course";

interface NodeDetailsPanelProps {
  module: ConceptMapModule | null;
  onClose: () => void;
  className?: string;
}

export function NodeDetailsPanel({
  module,
  onClose,
  className,
}: NodeDetailsPanelProps) {
  const isOpen = module !== null;

  return (
    <aside
      className={cn(
        "glass-strong absolute right-0 top-0 z-20 flex h-full w-full max-w-md flex-col border-l border-white/60 shadow-2xl transition-transform duration-300 ease-out sm:w-[400px]",
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}
      aria-hidden={!isOpen}
    >
      {module && <PanelContent module={module} onClose={onClose} />}
    </aside>
  );
}

function PanelContent({
  module,
  onClose,
}: {
  module: ConceptMapModule;
  onClose: () => void;
}) {
  const examStyle = examRelevanceConfig[module.likely_exam_relevance];
  const learningPoints = [...(module.learning_points ?? [])].sort(
    (a, b) =>
      examRelevanceConfig[b.exam_weight].priority -
      examRelevanceConfig[a.exam_weight].priority
  );
  const highCount = learningPoints.filter((p) => p.exam_weight === "high").length;

  return (
    <div className="flex h-full flex-col animate-fade-in">
      <PanelHeader module={module} examStyle={examStyle} onClose={onClose} />

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div
          className={cn(
            "rounded-2xl border px-4 py-3.5",
            examStyle.bannerClass
          )}
        >
          <ExamBanner
            examStyle={examStyle}
            highCount={highCount}
            note={module.exam_priority_note}
          />
        </div>

        <PanelStats module={module} examStyle={examStyle} />

        <section className="mt-6">
          <SectionLabel icon={Layers} label="Overview" />
          <p className="text-sm font-medium leading-relaxed text-foreground/90">
            {module.detailed_description}
          </p>
        </section>

        <section className="mt-6">
          <SectionLabel icon={BookOpen} label="What this really covers" />
          <p className="text-sm font-medium leading-relaxed text-foreground/90">
            {module.what_this_really_covers}
          </p>
          <p className="mt-2 text-xs font-semibold text-muted-foreground">
            Why it matters: {module.why_it_matters}
          </p>
        </section>

        <section className="mt-8">
          <SectionLabel icon={BookOpen} label="What you need to know" bold />
          <p className="mb-4 text-xs font-semibold text-muted-foreground">
            Sorted by exam importance — focus on{" "}
            <span className="text-amber-700">high yield</span> points first
          </p>
          <ul className="flex flex-col gap-2.5">
            {learningPoints.length > 0 ? (
              learningPoints.map((item, index) => {
                const pointStyle = examRelevanceConfig[item.exam_weight];
                return (
                  <li
                    key={`${item.point}-${index}`}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-sm leading-snug",
                      pointStyle.pointClass
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                        pointStyle.badgeClass
                      )}
                    >
                      {examWeightLabel(item.exam_weight)}
                    </span>
                    <p className="mt-1.5">{item.point}</p>
                  </li>
                );
              })
            ) : (
              <li className="glass-soft rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground">
                Regenerate your map to get detailed learning points for this
                topic.
              </li>
            )}
          </ul>
        </section>

        <section className="mt-8">
          <SectionLabel icon={GitBranch} label="Prerequisites" />
          {module.prerequisites.length > 0 ? (
            <TagList items={module.prerequisites} variant="pill" />
          ) : (
            <p className="text-sm font-medium text-muted-foreground">
              None — foundational module.
            </p>
          )}
        </section>

        <section className="mt-8 pb-4">
          <SectionLabel icon={Link2} label="Connects to" />
          {module.connects_to.length > 0 ? (
            <TagList items={module.connects_to} variant="soft" />
          ) : (
            <p className="text-sm font-medium text-muted-foreground">
              No direct connections listed.
            </p>
          )}
        </section>

        {module.common_student_confusions.length > 0 && (
          <section className="mt-8 pb-4">
            <SectionLabel icon={Target} label="Common confusions" />
            <TagList items={module.common_student_confusions} variant="soft" />
          </section>
        )}
      </div>
    </div>
  );
}

function PanelHeader({
  module,
  examStyle,
  onClose,
}: {
  module: ConceptMapModule;
  examStyle: (typeof examRelevanceConfig)[keyof typeof examRelevanceConfig];
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/60 px-6 py-5">
      <div>
        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
              examStyle.badgeClass
            )}
          >
            {examStyle.shortLabel}
          </span>
          <span className="glass-pill rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary">
            {module.importance}
          </span>
          <span className="glass-soft rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
            {module.difficulty}
          </span>
          </div>
          <h2 className="mt-2 text-xl font-extrabold leading-tight">
          {module.module}
        </h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="glass-pill rounded-xl p-2 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Close panel"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

function ExamBanner({
  examStyle,
  highCount,
  note,
}: {
  examStyle: (typeof examRelevanceConfig)[keyof typeof examRelevanceConfig];
  highCount: number;
  note?: string;
}) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 shrink-0" />
        <span className="text-sm font-extrabold">{examStyle.label}</span>
        {highCount > 0 && (
          <span className="ml-auto rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-bold">
            {highCount} high-yield point{highCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      {note && (
        <p className="mt-2 text-sm font-semibold leading-relaxed">{note}</p>
      )}
    </>
  );
}

function PanelStats({
  module,
  examStyle,
}: {
  module: ConceptMapModule;
  examStyle: (typeof examRelevanceConfig)[keyof typeof examRelevanceConfig];
}) {
  return (
    <div className="mt-4 flex gap-3">
      <Stat label="Mastery" icon={Clock}>
        ~{module.estimated_mastery_hours}h
      </Stat>
      <Stat
        label="Exam focus"
        icon={GraduationCap}
        className={cn("border", examStyle.bannerClass)}
      >
        <span className="capitalize">{module.likely_exam_relevance}</span>
      </Stat>
    </div>
  );
}

function SectionLabel({
  icon: Icon,
  label,
  bold,
}: {
  icon: typeof Layers;
  label: string;
  bold?: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-2 flex items-center gap-2 text-sm font-bold",
        bold ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </div>
  );
}

function TagList({
  items,
  variant,
}: {
  items: string[];
  variant: "pill" | "soft";
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((name) => (
        <li
          key={name}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs",
            variant === "pill"
              ? "glass-pill font-bold"
              : "glass-soft font-semibold text-muted-foreground"
          )}
        >
          {name}
        </li>
      ))}
    </ul>
  );
}

function Stat({
  label,
  icon: Icon,
  children,
  className,
}: {
  label: string;
  icon: typeof Clock;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col rounded-2xl px-3 py-2.5",
        className ?? "glass-soft"
      )}
    >
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <span className="text-sm font-extrabold">{children}</span>
    </div>
  );
}
