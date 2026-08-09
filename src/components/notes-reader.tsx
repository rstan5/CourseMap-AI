"use client";

import { useMemo, useState } from "react";
import type { CourseMapData } from "@/types/course";

interface NotesReaderProps {
  course: CourseMapData;
  focusModuleId?: string | null;
  onSelectModule?: (id: string) => void;
}

export function NotesReader({
  course,
  focusModuleId,
  onSelectModule,
}: NotesReaderProps) {
  const [showArchive, setShowArchive] = useState(false);
  const activeId = focusModuleId ?? course.concept_map[0]?.id ?? null;

  const active = useMemo(
    () => course.concept_map.find((m) => m.id === activeId) ?? null,
    [course.concept_map, activeId]
  );

  return (
    <div className="glass-strong mt-6 grid min-h-[520px] overflow-hidden rounded-3xl lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-white/50 p-4 lg:border-b-0 lg:border-r">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Your notes
        </p>
        <nav className="flex max-h-[200px] flex-col gap-1 overflow-y-auto lg:max-h-[480px]">
          {course.concept_map.map((module) => {
            const selected = module.id === activeId;
            return (
              <button
                key={module.id}
                type="button"
                onClick={() => onSelectModule?.(module.id)}
                className={`rounded-2xl px-3 py-2.5 text-left text-sm font-bold transition-colors ${
                  selected
                    ? "bg-primary/15 text-foreground"
                    : "text-muted-foreground hover:bg-white/40 hover:text-foreground"
                }`}
              >
                {module.module}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-0 flex-col p-5 sm:p-7">
        {active ? (
          <>
            <h3 className="text-xl font-extrabold">{active.module}</h3>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {active.what_this_really_covers || active.detailed_description}
            </p>
            <div className="mt-5 flex-1 overflow-y-auto whitespace-pre-wrap text-sm font-medium leading-relaxed text-foreground/90">
              {active.full_notes?.trim() ||
                "No preserved notes for this topic yet. Upload more materials to fill this page."}
            </div>
          </>
        ) : (
          <p className="text-sm font-semibold text-muted-foreground">
            No notes modules yet.
          </p>
        )}

        {course.sourceText?.trim() ? (
          <div className="mt-6 border-t border-white/50 pt-4">
            <button
              type="button"
              onClick={() => setShowArchive((v) => !v)}
              className="text-xs font-bold uppercase tracking-wider text-primary"
            >
              {showArchive ? "Hide original upload" : "Show original upload archive"}
            </button>
            {showArchive && (
              <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-white/40 p-4 text-xs font-medium leading-relaxed text-muted-foreground">
                {course.sourceText}
              </pre>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
