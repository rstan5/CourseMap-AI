export type ModuleImportance = "core" | "supporting" | "advanced";
export type ModuleDifficulty = "easy" | "medium" | "hard";
export type ExamRelevance = "high" | "medium" | "low";
export type ConfidenceLevel = "low" | "medium" | "high";

export interface CourseMapOverview {
  title: string;
  inferred_subject: string;
  structure_confidence: ConfidenceLevel;
  summary: string;
}

export interface LearningPoint {
  point: string;
  exam_weight: ExamRelevance;
}

export interface ConceptMapModule {
  id: string;
  module: string;
  description: string;
  learning_points: LearningPoint[];
  exam_priority_note: string;
  importance: ModuleImportance;
  difficulty: ModuleDifficulty;
  prerequisites: string[];
  connects_to: string[];
  likely_exam_relevance: ExamRelevance;
  estimated_mastery_hours: number;
}

export interface LearningSequenceStep {
  step: number;
  module_id: string;
  reason: string;
}

export interface HighLevelDependency {
  from: string;
  to: string;
  relationship: string;
}

export interface MissingOrUnclearArea {
  area: string;
  assumption_made: string;
  confidence: ConfidenceLevel;
}

export interface CourseMapPayload {
  course_map_overview: CourseMapOverview;
  concept_map: ConceptMapModule[];
  learning_sequence: LearningSequenceStep[];
  high_level_dependencies: HighLevelDependency[];
  missing_or_unclear_areas: MissingOrUnclearArea[];
}

export interface CourseMapData extends CourseMapPayload {
  id: string;
}

export interface GenerateCourseRequest {
  rawText: string;
}

export interface GenerateCourseResponse {
  success: boolean;
  data?: CourseMapData;
  error?: string;
  code?: "SUBSCRIPTION_REQUIRED" | "AUTH_REQUIRED";
  refined?: boolean;
  requiresAuth?: boolean;
}

export interface GetCourseMapResponse {
  success: boolean;
  data?: CourseMapData;
  error?: string;
  code?: "AUTH_REQUIRED";
}
