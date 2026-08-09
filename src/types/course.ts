export type ModuleImportance = "core" | "supporting" | "advanced";
export type ModuleDifficulty = "easy" | "medium" | "hard";
export type ExamRelevance = "high" | "medium" | "low";
export type ConfidenceLevel = "low" | "medium" | "high";

export interface CourseMapOverview {
  title: string;
  inferred_subject: string;
  structure_confidence: ConfidenceLevel;
  input_reconstruction_summary: string;
  key_themes: string[];
}

export interface LearningPoint {
  point: string;
  exam_weight: ExamRelevance;
}

export interface ConceptMapModule {
  id: string;
  module: string;
  detailed_description: string;
  what_this_really_covers: string;
  importance: ModuleImportance;
  difficulty: ModuleDifficulty;
  prerequisites: string[];
  connects_to: string[];
  why_it_matters: string;
  likely_exam_relevance: ExamRelevance;
  common_student_confusions: string[];
  learning_points: LearningPoint[];
  exam_priority_note: string;
  estimated_mastery_hours: number;
  /** Student's actual notes for this topic, reorganized but not summarized away. */
  full_notes: string;
}

export type LearningGraphRelationship =
  | "prerequisite"
  | "builds_on"
  | "related_to";

export interface LearningGraphEdge {
  from: string;
  to: string;
  relationship: LearningGraphRelationship;
}

export interface LearningSequenceStep {
  step: number;
  module_id: string;
  reason_for_position: string;
}

export interface HighYieldMap {
  must_know: string[];
  should_know: string[];
  nice_to_know: string[];
  reasoning: string;
}

export interface KnowledgeGap {
  missing_area: string;
  why_it_might_exist: string;
  assumption_made: string;
  impact_on_learning_map: string;
}

export interface CourseMapPayload {
  course_map_overview: CourseMapOverview;
  concept_map: ConceptMapModule[];
  learning_graph_edges: LearningGraphEdge[];
  learning_sequence: LearningSequenceStep[];
  high_yield_map: HighYieldMap;
  knowledge_gaps: KnowledgeGap[];
}

export interface CourseMapData extends CourseMapPayload {
  id: string;
  /** Original uploaded / pasted note text (verbatim archive). */
  sourceText?: string;
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

export type NotesChatRole = "user" | "assistant";

export interface NotesChatMessage {
  role: NotesChatRole;
  content: string;
}

export interface NotesChatRequest {
  mapId: string;
  message: string;
  history?: NotesChatMessage[];
  focusModuleId?: string;
}

export interface NotesChatResponse {
  success: boolean;
  reply?: string;
  error?: string;
  code?: "AUTH_REQUIRED";
}
