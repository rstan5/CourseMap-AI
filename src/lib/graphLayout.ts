import dagre from "dagre";
import type { Edge, Node } from "@xyflow/react";
import type { ConceptMapModule, LearningGraphEdge } from "@/types/course";

export type CourseNodeData = ConceptMapModule & {
  label: string;
  [key: string]: unknown;
};

export type CourseEdgeData = {
  edgeType: "prerequisite" | "builds_on" | "connects";
};

const NODE_WIDTH = 220;
const NODE_HEIGHT = 88;

function sanitizeNodeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function buildRefResolver(conceptMap: ConceptMapModule[]) {
  const refToNodeId = new Map<string, string>();

  for (const item of conceptMap) {
    const nodeId = sanitizeNodeId(item.id);
    refToNodeId.set(item.id, nodeId);
    refToNodeId.set(nodeId, nodeId);
    refToNodeId.set(item.module, nodeId);
    refToNodeId.set(item.module.toLowerCase().trim(), nodeId);
  }

  return (ref: string): string | null => {
    const trimmed = ref.trim();
    return (
      refToNodeId.get(trimmed) ??
      refToNodeId.get(trimmed.toLowerCase()) ??
      refToNodeId.get(sanitizeNodeId(trimmed)) ??
      null
    );
  };
}

function relationshipToEdgeType(
  relationship: LearningGraphEdge["relationship"]
): CourseEdgeData["edgeType"] {
  if (relationship === "prerequisite") return "prerequisite";
  if (relationship === "builds_on") return "builds_on";
  return "connects";
}

export function buildGraph(
  conceptMap: ConceptMapModule[],
  learningGraphEdges: LearningGraphEdge[] = []
): {
  nodes: Node<CourseNodeData>[];
  edges: Edge<CourseEdgeData>[];
} {
  const resolveRef = buildRefResolver(conceptMap);

  const nodes: Node<CourseNodeData>[] = conceptMap.map((item) => ({
    id: sanitizeNodeId(item.id),
    type: "courseNode",
    data: {
      ...item,
      label: item.module,
    },
    position: { x: 0, y: 0 },
  }));

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges: Edge<CourseEdgeData>[] = [];
  const edgeKeys = new Set<string>();

  const addEdge = (
    sourceId: string,
    targetId: string,
    edgeType: CourseEdgeData["edgeType"],
    prefix: string
  ) => {
    if (!nodeIds.has(sourceId) || !nodeIds.has(targetId) || sourceId === targetId) {
      return;
    }
    const key = `${sourceId}->${targetId}:${edgeType}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);

    edges.push({
      id: `${prefix}-${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      type: "smoothstep",
      data: { edgeType },
    });
  };

  for (const edge of learningGraphEdges) {
    const sourceId = resolveRef(edge.from);
    const targetId = resolveRef(edge.to);
    if (!sourceId || !targetId) continue;

    addEdge(
      sourceId,
      targetId,
      relationshipToEdgeType(edge.relationship),
      "graph"
    );
  }

  for (const item of conceptMap) {
    const targetId = sanitizeNodeId(item.id);

    for (const prereq of item.prerequisites ?? []) {
      const sourceId = resolveRef(prereq);
      if (!sourceId) continue;
      addEdge(sourceId, targetId, "prerequisite", "pre");
    }

    for (const related of item.connects_to ?? []) {
      const relatedId = resolveRef(related);
      if (!relatedId) continue;
      addEdge(targetId, relatedId, "connects", "conn");
    }
  }

  return { nodes, edges };
}

export function layoutGraph(
  nodes: Node<CourseNodeData>[],
  edges: Edge<CourseEdgeData>[]
): Node<CourseNodeData>[] {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: "TB",
    nodesep: 56,
    ranksep: 88,
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((node) => {
    graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  return nodes.map((node, index) => {
    const position = graph.node(node.id);
    const x = position?.x ?? (index % 4) * (NODE_WIDTH + 40);
    const y = position?.y ?? Math.floor(index / 4) * (NODE_HEIGHT + 48);
    return {
      ...node,
      position: {
        x: x - NODE_WIDTH / 2,
        y: y - NODE_HEIGHT / 2,
      },
    };
  });
}

export function prepareGraph(
  conceptMap: ConceptMapModule[],
  learningGraphEdges: LearningGraphEdge[] = []
) {
  const { nodes, edges } = buildGraph(conceptMap, learningGraphEdges);
  const layoutedNodes = layoutGraph(nodes, edges);
  return { nodes: layoutedNodes, edges };
}
