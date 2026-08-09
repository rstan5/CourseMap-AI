"use client";

import { useState } from "react";
import { CourseMapSection } from "@/components/course-map-section";
import { NotesChat } from "@/components/notes-chat";
import { NotesReader } from "@/components/notes-reader";
import type { CourseMapData } from "@/types/course";

type WorkspaceTab = "map" | "notes" | "chat";

interface NotesWorkspaceProps {
  course: CourseMapData;
}

export function NotesWorkspace({ course }: NotesWorkspaceProps) {
  const [tab, setTab] = useState<WorkspaceTab>("map");
  const [focusModuleId, setFocusModuleId] = useState<string | null>(
    course.concept_map[0]?.id ?? null
  );

  const focusTitle = course.concept_map.find((m) => m.id === focusModuleId)
    ?.module;

  return (
    <section className="mt-16 border-t border-white/50 pt-12">
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["map", "Map"],
            ["notes", "Notes"],
            ["chat", "Ask your notes"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tab === id
                ? "bg-primary text-primary-foreground"
                : "glass-pill text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "map" && <CourseMapSection course={course} embedded />}
      {tab === "notes" && (
        <NotesReader
          course={course}
          focusModuleId={focusModuleId}
          onSelectModule={setFocusModuleId}
        />
      )}
      {tab === "chat" && (
        <NotesChat
          mapId={course.id}
          focusModuleId={focusModuleId}
          focusModuleTitle={focusTitle}
        />
      )}
    </section>
  );
}
