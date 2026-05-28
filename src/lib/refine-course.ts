import OpenAI from "openai";
import {
  buildRefineCourseMapUserPrompt,
  COURSE_MAP_SYSTEM_PROMPT,
} from "@/lib/course-prompts";
import { normalizeCourseMap } from "@/lib/normalize-course-map";
import { courseMapResponseSchema } from "@/lib/course-schema";
import type { CourseMapPayload } from "@/types/course";

const DEFAULT_MODEL = "gpt-4o-mini";

export async function refineCourseStructure(
  openai: OpenAI,
  existingMap: CourseMapPayload,
  newMaterials: string
): Promise<CourseMapPayload> {
  const model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL;

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: COURSE_MAP_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildRefineCourseMapUserPrompt(existingMap, newMaterials),
      },
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
    console.error("Refine validation error:", validated.error.flatten());
    throw new Error(
      "The AI response did not match the required course map structure. Please try again."
    );
  }

  return normalizeCourseMap(validated.data as CourseMapPayload);
}
