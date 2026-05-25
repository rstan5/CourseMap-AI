"use client";

import { BookOpen, Loader2, Plus } from "lucide-react";
import { formatRelativeTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { CourseMapSummary } from "@/types/course-library";

interface CourseLibrarySidebarProps {
  maps: CourseMapSummary[];
  loading: boolean;
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewCourse: () => void;
  className?: string;
}

export function CourseLibrarySidebar({
  maps,
  loading,
  activeId,
  onSelect,
  onNewCourse,
  className,
}: CourseLibrarySidebarProps) {
  return (
    <aside
      className={cn(
        "glass-soft flex w-full shrink-0 flex-col rounded-3xl lg:w-64 xl:w-72",
        className
      )}
    >
      <div className="border-b border-white/50 px-4 py-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-extrabold">My courses</h2>
        </div>
        <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
          Saved automatically — switch anytime
        </p>
        <button
          type="button"
          onClick={onNewCourse}
          className="glass-button mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold text-primary-foreground transition-all hover:brightness-105"
        >
          <Plus className="h-3.5 w-3.5" />
          New course
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}

        {!loading && maps.length === 0 && (
          <p className="px-2 py-6 text-center text-xs font-semibold text-muted-foreground">
            Your course maps will appear here after you generate one.
          </p>
        )}

        <ul className="flex flex-col gap-1">
          {maps.map((map) => {
            const active = map.id === activeId;
            return (
              <li key={map.id}>
                <button
                  type="button"
                  onClick={() => onSelect(map.id)}
                  className={cn(
                    "w-full rounded-2xl px-3 py-3 text-left transition-colors",
                    active
                      ? "bg-primary/15 ring-1 ring-primary/25"
                      : "hover:bg-white/50"
                  )}
                >
                  <p
                    className={cn(
                      "line-clamp-2 text-sm font-extrabold leading-snug",
                      active && "text-primary"
                    )}
                  >
                    {map.title}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] font-semibold text-muted-foreground">
                    {map.subject}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold text-muted-foreground/80">
                    {map.moduleCount} modules · {formatRelativeTime(map.updatedAt)}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
