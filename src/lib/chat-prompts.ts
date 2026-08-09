import type { CourseMapData, NotesChatMessage } from "@/types/course";

export const NOTES_ASSISTANT_SYSTEM_PROMPT = `
You are the CourseMap notes assistant.

You help a student navigate, search, rewrite, and elaborate on THEIR notes — the notes stored in this CourseMap.

Rules:
- Treat full_notes + source archive as the source of truth.
- When they ask where something is, point to the module name and quote or paraphrase the relevant note text.
- When they ask you to extract info (dates, formulas, definitions, lists), pull it from the notes. If it is not there, say so clearly.
- When they ask you to rewrite or elaborate, improve clarity and completeness WITHOUT inventing facts that contradict or replace their notes. Mark any extra explanation you add as "added context".
- Be concise unless they ask for a full rewrite.
- Do not claim you can see files that are not in the provided notes.
`.trim();

function clip(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n\n[...truncated...]`;
}

export function buildNotesAssistantUserPrompt(input: {
  course: CourseMapData;
  message: string;
  history?: NotesChatMessage[];
  focusModuleId?: string;
}): string {
  const { course, message, history = [], focusModuleId } = input;

  const modules = course.concept_map.map((m) => ({
    id: m.id,
    title: m.module,
    full_notes: m.full_notes,
    overview: m.detailed_description,
  }));

  const focus = focusModuleId
    ? modules.find((m) => m.id === focusModuleId)
    : undefined;

  const historyBlock =
    history.length > 0
      ? history
          .slice(-8)
          .map((h) => `${h.role === "user" ? "Student" : "Assistant"}: ${h.content}`)
          .join("\n\n")
      : "(none)";

  return `
COURSE: ${course.course_map_overview.title} (${course.course_map_overview.inferred_subject})

NOTE MAP MODULES (structured digital notes):
${clip(JSON.stringify(modules, null, 2), 70000)}

${
  focus
    ? `STUDENT IS CURRENTLY FOCUSED ON MODULE: ${focus.title} (${focus.id})`
    : "No specific module is focused."
}

ORIGINAL UPLOAD ARCHIVE (verbatim):
${clip(course.sourceText ?? "", 25000)}

RECENT CHAT:
${historyBlock}

STUDENT MESSAGE:
${message}
`.trim();
}
