import type { CourseMapData } from "@/types/course";

/** Static sample shown on the landing page — not from the API */
export const DEMO_COURSE_MAP: CourseMapData = {
  id: "demo",
  course_map_overview: {
    title: "Introduction to Economics",
    inferred_subject: "Economics",
    structure_confidence: "high",
    summary:
      "A foundational map from scattered notes into a clear path through markets, pricing, and incentives.",
  },
  concept_map: [
    {
      id: "supply-demand",
      module: "Supply & Demand",
      description:
        "How buyers and sellers interact to set prices and quantities in competitive markets.",
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
      estimated_mastery_hours: 4,
    },
    {
      id: "market-equilibrium",
      module: "Market Equilibrium",
      description:
        "The price and quantity where the market clears with no shortage or surplus.",
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
      estimated_mastery_hours: 3,
    },
    {
      id: "elasticity",
      module: "Elasticity",
      description:
        "Measures how responsive quantity is to changes in price or income.",
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
      estimated_mastery_hours: 5,
    },
    {
      id: "consumer-surplus",
      module: "Consumer & Producer Surplus",
      description:
        "Welfare gained by buyers and sellers above what they paid or below their cost.",
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
      estimated_mastery_hours: 3,
    },
    {
      id: "market-failures",
      module: "Market Failures",
      description:
        "When free markets fail to allocate resources efficiently on their own.",
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
      estimated_mastery_hours: 4,
    },
  ],
  learning_sequence: [],
  high_level_dependencies: [],
  missing_or_unclear_areas: [],
};

export const DEMO_HIGHLIGHT_MODULE_ID = "supply-demand";
