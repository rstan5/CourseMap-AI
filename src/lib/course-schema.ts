import { z } from "zod";

export const courseMapOverviewSchema = z.object({
  title: z.string(),
  inferred_subject: z.string(),
  structure_confidence: z.enum(["low", "medium", "high"]),
  summary: z.string(),
});

export const learningPointSchema = z.object({
  point: z.string(),
  exam_weight: z.enum(["high", "medium", "low"]),
});

export const conceptMapModuleSchema = z.object({
  id: z.string(),
  module: z.string(),
  description: z.string(),
  learning_points: z.array(learningPointSchema).optional().default([]),
  exam_priority_note: z.string().optional().default(""),
  importance: z.enum(["core", "supporting", "advanced"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  prerequisites: z.array(z.string()).default([]),
  connects_to: z.array(z.string()).default([]),
  likely_exam_relevance: z.enum(["high", "medium", "low"]),
  estimated_mastery_hours: z.number(),
});

export const learningSequenceStepSchema = z.object({
  step: z.number(),
  module_id: z.string(),
  reason: z.string(),
});

export const highLevelDependencySchema = z.object({
  from: z.string(),
  to: z.string(),
  relationship: z.string(),
});

export const missingOrUnclearAreaSchema = z.object({
  area: z.string(),
  assumption_made: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
});

export const courseMapResponseSchema = z.object({
  course_map_overview: courseMapOverviewSchema,
  concept_map: z.array(conceptMapModuleSchema).min(3).max(24),
  learning_sequence: z.array(learningSequenceStepSchema).default([]),
  high_level_dependencies: z.array(highLevelDependencySchema).default([]),
  missing_or_unclear_areas: z.array(missingOrUnclearAreaSchema).default([]),
});

export type CourseMapResponseSchema = z.infer<typeof courseMapResponseSchema>;

export const courseStructureSchema = courseMapResponseSchema;
