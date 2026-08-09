"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Edge,
  type OnSelectionChangeParams,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CourseNode } from "@/components/course-node";
import { NodeDetailsPanel } from "@/components/NodeDetailsPanel";
import {
  prepareGraph,
  type CourseEdgeData,
  type CourseNodeData,
} from "@/lib/graphLayout";
import type { ConceptMapModule, LearningGraphEdge } from "@/types/course";

const nodeTypes = { courseNode: CourseNode };

function styleEdges(rawEdges: Edge<CourseEdgeData>[]): Edge<CourseEdgeData>[] {
  return rawEdges.map((edge) => {
    const edgeType = edge.data?.edgeType ?? "connects";

    if (edgeType === "prerequisite") {
      const color = "#8b9cf8";
      return {
        ...edge,
        style: { stroke: color, strokeWidth: 2.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color,
        },
      };
    }

    if (edgeType === "builds_on") {
      const color = "#9a7dff";
      return {
        ...edge,
        style: { stroke: color, strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color,
        },
      };
    }

    const color = "#c4cff9";
    return {
      ...edge,
      style: { stroke: color, strokeWidth: 1.5, strokeDasharray: "8 6" },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color,
      },
    };
  });
}

interface CourseGraphInnerProps {
  conceptMap: ConceptMapModule[];
  learningGraphEdges?: LearningGraphEdge[];
  className?: string;
  height?: string;
  previewMode?: boolean;
}

function CourseGraphInner({
  conceptMap,
  learningGraphEdges = [],
  className,
  height = "min-h-[70vh]",
  previewMode = false,
}: CourseGraphInnerProps) {
  const [selectedModule, setSelectedModule] = useState<ConceptMapModule | null>(
    null
  );
  const { fitView } = useReactFlow();

  const graphKey = useMemo(
    () =>
      conceptMap
        .map((m) => m.id)
        .sort()
        .join("|"),
    [conceptMap]
  );

  const prepared = useMemo(
    () => prepareGraph(conceptMap, learningGraphEdges),
    [conceptMap, learningGraphEdges]
  );
  const styledEdges = useMemo(
    () => styleEdges(prepared.edges),
    [prepared.edges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(prepared.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(styledEdges);

  useEffect(() => {
    setNodes(prepared.nodes);
    setEdges(styledEdges);
  }, [graphKey, prepared.nodes, prepared.edges, setNodes, setEdges]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fitView({ padding: 0.2, duration: 400 });
    }, 80);
    return () => clearTimeout(timer);
    // fitView identity changes every render; only re-fit when graph data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphKey]);

  const selectModule = useCallback((data: CourseNodeData) => {
    setSelectedModule({
      id: data.id,
      module: data.module,
      detailed_description: data.detailed_description,
      what_this_really_covers: data.what_this_really_covers,
      why_it_matters: data.why_it_matters,
      common_student_confusions: data.common_student_confusions ?? [],
      learning_points: data.learning_points ?? [],
      exam_priority_note: data.exam_priority_note ?? "",
      importance: data.importance,
      difficulty: data.difficulty,
      prerequisites: data.prerequisites,
      connects_to: data.connects_to,
      likely_exam_relevance: data.likely_exam_relevance,
      estimated_mastery_hours: data.estimated_mastery_hours,
      full_notes: data.full_notes ?? "",
    });
  }, []);

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      if (selectedNodes.length === 0) {
        setSelectedModule(null);
        return;
      }
      selectModule(selectedNodes[0].data as CourseNodeData);
    },
    [selectModule]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<CourseNodeData>) => {
      selectModule(node.data);
    },
    [selectModule]
  );

  const onPaneClick = useCallback(() => {
    setSelectedModule(null);
  }, []);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl ${height} ${className ?? ""}`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={previewMode ? undefined : onNodeClick}
        onPaneClick={previewMode ? undefined : onPaneClick}
        onSelectionChange={previewMode ? undefined : onSelectionChange}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={!previewMode}
        panOnDrag={!previewMode}
        zoomOnScroll={!previewMode}
        zoomOnPinch={!previewMode}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        className="bg-[#eef2ff]/40"
      >
        <Background gap={20} size={1} color="#c8d4ff" />
        {!previewMode && (
          <>
            <Controls
              showInteractive={false}
              className="!glass-strong !rounded-2xl !border-white/80 !shadow-lg"
            />
            <MiniMap
              nodeColor={(n) => {
                const imp = (n.data as CourseNodeData).importance;
                if (imp === "core") return "#8b9cf8";
                if (imp === "advanced") return "#d4a8ff";
                return "#b8c5f5";
              }}
              maskColor="rgba(244, 247, 255, 0.75)"
              className="!glass-strong !rounded-2xl !border-white/80"
            />
          </>
        )}
      </ReactFlow>

      {!previewMode && (
        <NodeDetailsPanel
          module={selectedModule}
          onClose={() => setSelectedModule(null)}
        />
      )}

      <div className="glass-pill pointer-events-none absolute bottom-4 left-4 z-10 flex max-w-[calc(100%-2rem)] flex-wrap gap-3 rounded-2xl px-4 py-2.5 text-xs font-bold text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 rounded bg-[#8b9cf8]" />
          Prerequisite
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 rounded bg-[#9a7dff]" />
          Builds on
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 rounded border-t-2 border-dashed border-primary/50" />
          Related
        </span>
      </div>
    </div>
  );
}

interface CourseGraphProps {
  conceptMap: ConceptMapModule[];
  learningGraphEdges?: LearningGraphEdge[];
  className?: string;
  height?: string;
  /** Landing page: static visual, no slide-over panel */
  previewMode?: boolean;
}

export function CourseGraph(props: CourseGraphProps) {
  return (
    <ReactFlowProvider>
      <CourseGraphInner {...props} />
    </ReactFlowProvider>
  );
}
