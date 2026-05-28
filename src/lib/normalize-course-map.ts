import type {
  ConceptMapModule,
  CourseMapOverview,
  CourseMapPayload,
  KnowledgeGap,
  LearningGraphEdge,
  LearningSequenceStep,
} from "@/types/course";

type LegacyOverview = CourseMapOverview & { summary?: string };
type LegacyModule = ConceptMapModule & { description?: string };
type LegacySequence = LearningSequenceStep & { reason?: string };
type LegacyGap = KnowledgeGap & { area?: string };

function normalizeModule(module: ConceptMapModule): ConceptMapModule {
  const legacy = module as LegacyModule;
  const description =
    module.detailed_description?.trim() || legacy.description?.trim() || "";

  const learningPoints =
    module.learning_points.length > 0
      ? module.learning_points
      : [
          {
            point: description || module.module,
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
    detailed_description:
      description || module.what_this_really_covers || module.module,
    what_this_really_covers:
      module.what_this_really_covers || description || module.module,
    why_it_matters:
      module.why_it_matters ||
      "Supports deeper understanding of the course structure.",
    common_student_confusions: module.common_student_confusions ?? [],
    learning_points: learningPoints,
    exam_priority_note: examNote,
    estimated_mastery_hours: Math.max(1, module.estimated_mastery_hours ?? 2),
  };
}

function normalizeLearningGraphEdges(
  edges: LearningGraphEdge[] | undefined,
  conceptMap: ConceptMapModule[]
): LearningGraphEdge[] {
  if (edges && edges.length > 0) return edges;

  const derived: LearningGraphEdge[] = [];
  const edgeKeys = new Set<string>();

  const add = (from: string, to: string, relationship: LearningGraphEdge["relationship"]) => {
    const key = `${from}->${to}:${relationship}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    derived.push({ from, to, relationship });
  };

  for (const item of conceptMap) {
    for (const prereq of item.prerequisites) {
      add(prereq, item.id, "prerequisite");
    }
    for (const related of item.connects_to) {
      add(item.id, related, "related_to");
    }
  }

  return derived;
}

function normalizeKnowledgeGaps(gaps: KnowledgeGap[] | undefined): KnowledgeGap[] {
  return (gaps ?? []).map((gap) => {
    const legacy = gap as LegacyGap;
    return {
      missing_area: gap.missing_area || legacy.area || "Unspecified gap",
      why_it_might_exist: gap.why_it_might_exist || "Not explicit in source materials",
      assumption_made: gap.assumption_made,
      impact_on_learning_map:
        gap.impact_on_learning_map || "May reduce map completeness",
    };
  });
}

export function normalizeCourseMap(data: CourseMapPayload): CourseMapPayload {
  const legacyOverview = data.course_map_overview as LegacyOverview;
  const conceptMap = data.concept_map.map((m) =>
    normalizeModule(m as ConceptMapModule)
  );

  return {
    course_map_overview: {
      ...data.course_map_overview,
      input_reconstruction_summary:
        data.course_map_overview.input_reconstruction_summary ||
        legacyOverview.summary ||
        "Course structure reconstructed from provided materials.",
      key_themes: data.course_map_overview.key_themes ?? [],
    },
    concept_map: conceptMap,
    learning_graph_edges: normalizeLearningGraphEdges(
      data.learning_graph_edges,
      conceptMap
    ),
    learning_sequence: (data.learning_sequence ?? []).map((step) => {
      const legacy = step as LegacySequence;
      return {
        ...step,
        reason_for_position:
          step.reason_for_position || legacy.reason || "Dependency order",
      };
    }),
    high_yield_map: data.high_yield_map ?? {
      must_know: [],
      should_know: [],
      nice_to_know: [],
      reasoning: "",
    },
    knowledge_gaps: normalizeKnowledgeGaps(data.knowledge_gaps),
  };
}
