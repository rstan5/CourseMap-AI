"use client";

import type { ReactNode } from "react";
import { CourseLibrarySidebar } from "@/components/course-library-sidebar";
import type { CourseMapSummary } from "@/types/course-library";

interface CourseWorkspaceShellProps {
  children: ReactNode;
  maps: CourseMapSummary[];
  mapsLoading: boolean;
  activeMapId: string | null;
  onSelectMap: (id: string) => void;
  onNewCourse: () => void;
  mobileMapTitle?: string;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}

export function CourseWorkspaceShell({
  children,
  maps,
  mapsLoading,
  activeMapId,
  onSelectMap,
  onNewCourse,
  mobileMapTitle,
  isAuthenticated,
  onRequireAuth,
}: CourseWorkspaceShellProps) {
  const handleSelect = (id: string) => {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }
    onSelectMap(id);
  };

  const handleNew = () => {
    onNewCourse();
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pb-20 pt-4 sm:px-6 sm:pt-8 lg:flex-row lg:gap-6">
      {isAuthenticated && (
        <>
          <div className="lg:hidden">
            <label className="mb-1 block text-xs font-bold text-muted-foreground">
              Your courses
            </label>
            <select
              value={activeMapId ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value) handleSelect(value);
                else handleNew();
              }}
              className="glass-soft w-full rounded-2xl px-4 py-3 text-sm font-semibold"
            >
              <option value="">+ New course</option>
              {maps.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
            {mobileMapTitle && (
              <p className="mt-2 truncate text-sm font-extrabold">{mobileMapTitle}</p>
            )}
          </div>

          <CourseLibrarySidebar
            maps={maps}
            loading={mapsLoading}
            activeId={activeMapId}
            onSelect={handleSelect}
            onNewCourse={handleNew}
            className="hidden max-h-[calc(100dvh-8rem)] lg:flex lg:sticky lg:top-24"
          />
        </>
      )}

      {!isAuthenticated && (
        <p className="glass-soft rounded-2xl px-4 py-3 text-center text-xs font-semibold text-muted-foreground lg:hidden">
          Sign in to see your saved courses in the sidebar.
        </p>
      )}

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
