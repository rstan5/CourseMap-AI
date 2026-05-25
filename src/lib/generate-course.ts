import OpenAI from "openai";
import {
  buildCourseMapUserPrompt,
  COURSE_MAP_SYSTEM_PROMPT,
} from "@/lib/course-prompts";
import { courseMapResponseSchema } from "@/lib/course-schema";
import type { CourseMapPayload, ConceptMapModule } from "@/types/course";

const DEFAULT_MODEL = "gpt-4o-mini";

function normalizeModule(module: ConceptMapModule): ConceptMapModule {
  const learningPoints =
    module.learning_points.length > 0
      ? module.learning_points
      : [
          {
            point: module.description,
            exam_weight: module.likely_exam_relevance,
          },
        ];

  const examNote =
    module.exam_priority_note ||
    (module.likely_exam_relevance === "high"
      ? "This topic is likely to appear on exams — prioritize mastering it."
      : module.likely_exam_relevance === "medium"
        ? "Useful for exams as supporting context."
        : "Lower exam priority — review after core topics.");

  return {
    ...module,
    learning_points: learningPoints,
    exam_priority_note: examNote,
  };
}

function normalizeCourseMap(data: CourseMapPayload): CourseMapPayload {
  return {
    ...data,
    concept_map: data.concept_map.map(normalizeModule),
  };
}

export async function generateCourseStructure(
  openai: OpenAI,
  rawText: string
): Promise<CourseMapPayload> {
  const model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL;

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: COURSE_MAP_SYSTEM_PROMPT },
      { role: "user", content: buildCourseMapUserPrompt(rawText) },
    ],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("OpenAI returned invalid JSON.");
  }

  const validated = courseMapResponseSchema.safeParse(parsed);
  if (!validated.success) {
    console.error("Course map validation error:", validated.error.flatten());
    throw new Error(
      "The AI response did not match the required course map structure. Please try again."
    );
  }

  return normalizeCourseMap(validated.data as CourseMapPayload);
}
