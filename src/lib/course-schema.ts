import { z } from "zod";

export const courseMapOverviewSchema = z.object({
  title: z.string(),
  inferred_subject: z.string(),
  structure_confidence: z.enum(["low", "medium", "high"]),
  input_reconstruction_summary: z.string().optional(),
  summary: z.string().optional(),
  key_themes: z.array(z.string()).default([]),
});

export const learningPointSchema = z.object({
  point: z.string(),
  exam_weight: z.enum(["high", "medium", "low"]),
});

export const conceptMapModuleSchema = z.object({
  id: z.string(),
  module: z.string(),
  detailed_description: z.string().optional(),
  description: z.string().optional(),
  what_this_really_covers: z.string().optional().default(""),
  learning_points: z.array(learningPointSchema).optional().default([]),
  exam_priority_note: z.string().optional().default(""),
  importance: z.enum(["core", "supporting", "advanced"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  prerequisites: z.array(z.string()).default([]),
  connects_to: z.array(z.string()).default([]),
  why_it_matters: z.string().optional().default(""),
  likely_exam_relevance: z.enum(["high", "medium", "low"]),
  common_student_confusions: z.array(z.string()).optional().default([]),
  estimated_mastery_hours: z.number().optional().default(2),
  full_notes: z.string().optional().default(""),
});

export const learningSequenceStepSchema = z.object({
  step: z.number(),
  module_id: z.string(),
  reason_for_position: z.string().optional(),
  reason: z.string().optional(),
});

export const learningGraphEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  relationship: z.enum(["prerequisite", "builds_on", "related_to"]),
});

export const highYieldMapSchema = z.object({
  must_know: z.array(z.string()).default([]),
  should_know: z.array(z.string()).default([]),
  nice_to_know: z.array(z.string()).default([]),
  reasoning: z.string().default(""),
});

export const knowledgeGapSchema = z.object({
  missing_area: z.string().optional(),
  area: z.string().optional(),
  why_it_might_exist: z.string().optional().default(""),
  assumption_made: z.string(),
  impact_on_learning_map: z.string().optional().default(""),
});

export const courseMapResponseSchema = z.object({
  course_map_overview: courseMapOverviewSchema,
  concept_map: z.array(conceptMapModuleSchema).min(3).max(40),
  learning_graph_edges: z.array(learningGraphEdgeSchema).default([]),
  learning_sequence: z.array(learningSequenceStepSchema).default([]),
  high_yield_map: highYieldMapSchema.default({
    must_know: [],
    should_know: [],
    nice_to_know: [],
    reasoning: "",
  }),
  knowledge_gaps: z.array(knowledgeGapSchema).default([]),
});

export type CourseMapResponseSchema = z.infer<typeof courseMapResponseSchema>;

export const courseStructureSchema = courseMapResponseSchema;
