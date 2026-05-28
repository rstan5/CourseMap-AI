import type { CourseMapData } from "@/types/course";

/** Static sample shown on the landing page — not from the API */
export const DEMO_COURSE_MAP: CourseMapData = {
  id: "demo",
  course_map_overview: {
    title: "Introduction to Economics",
    inferred_subject: "Economics",
    structure_confidence: "high",
    input_reconstruction_summary:
      "A foundational map from scattered notes into a clear path through markets, pricing, and incentives.",
    key_themes: [
      "market incentives",
      "equilibrium dynamics",
      "welfare analysis",
      "market failures",
    ],
  },
  concept_map: [
    {
      id: "supply-demand",
      module: "Supply & Demand",
      detailed_description:
        "How buyers and sellers interact to set prices and quantities in competitive markets.",
      what_this_really_covers:
        "The base model for market behavior, pricing pressure, and resource allocation.",
      why_it_matters:
        "Most economics exam questions rely on this as the starting framework.",
      learning_points: [
        {
          point: "Demand curves slope downward — price up, quantity demanded down",
          exam_weight: "high",
        },
        {
          point: "Supply curves slope upward — higher price motivates more production",
          exam_weight: "high",
        },
        {
          point: "Equilibrium is where quantity supplied equals quantity demanded",
          exam_weight: "high",
        },
      ],
      exam_priority_note:
        "Core framework for most exam questions — master this before anything else.",
      importance: "core",
      difficulty: "medium",
      prerequisites: [],
      connects_to: ["elasticity", "market-equilibrium"],
      likely_exam_relevance: "high",
      common_student_confusions: [
        "Mixing up movement along a curve vs a curve shift",
      ],
      estimated_mastery_hours: 4,
    },
    {
      id: "market-equilibrium",
      module: "Market Equilibrium",
      detailed_description:
        "The price and quantity where the market clears with no shortage or surplus.",
      what_this_really_covers:
        "How price-adjustment mechanisms restore market balance under changing conditions.",
      why_it_matters:
        "Equilibrium shift questions are frequent in assessments and case problems.",
      learning_points: [
        {
          point: "Shortages push prices up; surpluses push prices down",
          exam_weight: "high",
        },
        {
          point: "Shifts in supply or demand create new equilibria",
          exam_weight: "medium",
        },
      ],
      exam_priority_note: "Often tested with graph shifts and real-world scenarios.",
      importance: "core",
      difficulty: "medium",
      prerequisites: ["supply-demand"],
      connects_to: ["elasticity"],
      likely_exam_relevance: "high",
      common_student_confusions: [
        "Confusing equilibrium quantity with maximum quantity demanded",
      ],
      estimated_mastery_hours: 3,
    },
    {
      id: "elasticity",
      module: "Elasticity",
      detailed_description:
        "Measures how responsive quantity is to changes in price or income.",
      what_this_really_covers:
        "Sensitivity analysis for demand and supply, including interpretation and policy/business implications.",
      why_it_matters:
        "Elasticity is often tested through formulas, interpretation, and strategic decision scenarios.",
      learning_points: [
        {
          point: "Elastic demand: quantity changes a lot when price changes",
          exam_weight: "high",
        },
        {
          point: "Inelastic demand: quantity barely moves when price changes",
          exam_weight: "medium",
        },
      ],
      exam_priority_note: "High-yield for calculation and interpretation questions.",
      importance: "core",
      difficulty: "hard",
      prerequisites: ["supply-demand", "market-equilibrium"],
      connects_to: ["consumer-surplus"],
      likely_exam_relevance: "high",
      common_student_confusions: [
        "Treating elasticity as slope rather than percentage responsiveness",
      ],
      estimated_mastery_hours: 5,
    },
    {
      id: "consumer-surplus",
      module: "Consumer & Producer Surplus",
      detailed_description:
        "Welfare gained by buyers and sellers above what they paid or below their cost.",
      what_this_really_covers:
        "Welfare measurement and the efficiency impact of taxes, controls, and distortions.",
      why_it_matters:
        "It links core graph analysis to policy evaluation and deadweight loss.",
      learning_points: [
        {
          point: "Consumer surplus is area below demand, above price",
          exam_weight: "medium",
        },
        {
          point: "Deadweight loss shows lost welfare from market distortion",
          exam_weight: "medium",
        },
      ],
      exam_priority_note: "Graph-based questions are common on midterms.",
      importance: "supporting",
      difficulty: "medium",
      prerequisites: ["elasticity"],
      connects_to: ["market-failures"],
      likely_exam_relevance: "medium",
      common_student_confusions: [
        "Placing surplus areas on the wrong side of market price",
      ],
      estimated_mastery_hours: 3,
    },
    {
      id: "market-failures",
      module: "Market Failures",
      detailed_description:
        "When free markets fail to allocate resources efficiently on their own.",
      what_this_really_covers:
        "Externalities, public goods, and intervention logic when private incentives diverge from social outcomes.",
      why_it_matters:
        "This explains when and why policy intervention can improve efficiency.",
      learning_points: [
        {
          point: "Externalities cause private costs/benefits to differ from social",
          exam_weight: "high",
        },
        {
          point: "Public goods are non-excludable and non-rival",
          exam_weight: "low",
        },
      ],
      exam_priority_note: "Know definitions and one example each for exams.",
      importance: "advanced",
      difficulty: "hard",
      prerequisites: ["consumer-surplus"],
      connects_to: [],
      likely_exam_relevance: "medium",
      common_student_confusions: [
        "Assuming all government intervention always improves outcomes",
      ],
      estimated_mastery_hours: 4,
    },
  ],
  learning_graph_edges: [
    { from: "supply-demand", to: "market-equilibrium", relationship: "prerequisite" },
    { from: "market-equilibrium", to: "elasticity", relationship: "builds_on" },
    { from: "elasticity", to: "consumer-surplus", relationship: "builds_on" },
    { from: "consumer-surplus", to: "market-failures", relationship: "related_to" },
  ],
  learning_sequence: [],
  high_yield_map: {
    must_know: ["supply-demand", "market-equilibrium", "elasticity"],
    should_know: ["consumer-surplus"],
    nice_to_know: ["market-failures"],
    reasoning:
      "Intro economics exams heavily emphasize graph fundamentals and elasticity, with welfare and failures as applied extensions.",
  },
  knowledge_gaps: [],
};

export const DEMO_HIGHLIGHT_MODULE_ID = "supply-demand";
